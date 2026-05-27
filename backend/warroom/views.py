from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Program, Org, Proposal, UserProgramTracking
from .serializers import ProgramSerializer, OrgSerializer, ProposalSerializer


class ProgramListView(generics.ListAPIView):
    serializer_class = ProgramSerializer

    def get_queryset(self):
        return Program.objects.filter(is_active=True).annotate(org_count=Count('orgs'))


class ProgramDetailView(generics.RetrieveAPIView):
    serializer_class = ProgramSerializer
    lookup_field = 'name'

    def get_queryset(self):
        return Program.objects.filter(is_active=True).annotate(org_count=Count('orgs'))


class OrgListView(generics.ListAPIView):
    serializer_class = OrgSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['programs__name']

    def get_queryset(self):
        return Org.objects.all()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_tracking(request):
    program_slug = request.data.get('program_slug')
    org_ids = request.data.get('org_ids', [])
    try:
        program = Program.objects.get(name=program_slug)
    except Program.DoesNotExist:
        return Response({'error': 'program not found'}, status=status.HTTP_404_NOT_FOUND)

    tracking, created = UserProgramTracking.objects.get_or_create(
        user=request.user, program=program
    )
    if org_ids:
        tracking.orgs.set(Org.objects.filter(id__in=org_ids))
    tracking.save()
    return Response({'tracking': True, 'created': created})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def roadmap(request):
    user = request.user
    has_tracked_orgs = UserProgramTracking.objects.filter(user=user, orgs__isnull=False).distinct().exists()
    has_merged_pr = user.profile.total_prs_merged > 0
    has_draft = Proposal.objects.filter(user=user, status='draft').exists()
    has_feedback = Proposal.objects.filter(user=user).exclude(mentor_feedback='').exists()
    has_submitted = Proposal.objects.filter(user=user, status='submitted').exists()
    return Response({'steps': [
        {'id': 1, 'label': 'Track an org', 'done': has_tracked_orgs},
        {'id': 2, 'label': 'Merge a PR', 'done': has_merged_pr},
        {'id': 3, 'label': 'Draft a proposal', 'done': has_draft},
        {'id': 4, 'label': 'Receive mentor feedback', 'done': has_feedback},
        {'id': 5, 'label': 'Submit proposal', 'done': has_submitted},
    ]})


class ProposalListCreateView(generics.ListCreateAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Proposal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        from activity.utils import record_activity
        proposal = serializer.save(user=self.request.user)
        record_activity(
            user=self.request.user,
            activity_type='draft_proposal',
            title=f'draft · {proposal.program.name} proposal · {proposal.org.name}',
            metadata={'proposal_id': proposal.id, 'version': proposal.version},
        )


class ProposalUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Proposal.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        if serializer.validated_data.get('status') == 'submitted':
            serializer.save(submitted_at=timezone.now())
            profile = self.request.user.profile
            profile.total_proposals_submitted += 1
            profile.save(update_fields=['total_proposals_submitted'])
        else:
            serializer.save(version=instance.version + 1)
