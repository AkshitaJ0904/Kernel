from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Track, Module, UserProgress
from .serializers import TrackSerializer, TrackDetailSerializer, ModuleSerializer, UserProgressSerializer
from activity.utils import record_activity, update_streak


class TrackListView(generics.ListAPIView):
    serializer_class = TrackSerializer

    def get_queryset(self):
        return Track.objects.annotate(module_count=Count('modules'))


class TrackDetailView(generics.RetrieveAPIView):
    serializer_class = TrackDetailSerializer
    lookup_field = 'name'

    def get_queryset(self):
        return Track.objects.annotate(module_count=Count('modules'))


class TrackModulesView(generics.ListAPIView):
    serializer_class = ModuleSerializer

    def get_queryset(self):
        return Module.objects.filter(track__name=self.kwargs['name'])


class ModuleDetailView(generics.RetrieveAPIView):
    serializer_class = ModuleSerializer

    def get_object(self):
        return get_object_or_404(
            Module,
            track__name=self.kwargs['name'],
            slug=self.kwargs['slug'],
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_progress(request):
    serializer = UserProgressSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    module = serializer.validated_data.get('module')
    project = serializer.validated_data.get('project')
    new_status = serializer.validated_data['status']

    if module:
        prog, _ = UserProgress.objects.get_or_create(user=request.user, module=module)
        item_title = f'workshop/{module.track.name}/{module.slug}'
    elif project:
        prog, _ = UserProgress.objects.get_or_create(user=request.user, project=project)
        item_title = f'workshop/project/{project.slug}'
    else:
        return Response({'error': 'module or project required'}, status=status.HTTP_400_BAD_REQUEST)

    old_status = prog.status
    prog.status = new_status
    if new_status == 'in_progress' and not prog.started_at:
        prog.started_at = timezone.now()
        record_activity(
            user=request.user,
            activity_type='started_module',
            title=f'started · {item_title}',
            metadata={},
        )
    elif new_status == 'completed' and old_status != 'completed':
        prog.completed_at = timezone.now()
        update_streak(request.user)
    prog.save()
    return Response({'status': prog.status})
