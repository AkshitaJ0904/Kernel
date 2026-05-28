from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from rest_framework.generics import get_object_or_404
from .models import (
    Program, Org, Proposal, UserProgramTracking, VideoTopic, Video,
    VideoProgress, VideoNote,
)
from .serializers import (
    ProgramSerializer, OrgSerializer, ProposalSerializer,
    ContestDetailSerializer, VideoDetailSerializer, VideoListItemSerializer,
    VideoNoteSerializer,
)

# completion threshold: watching >= 90% marks the video done
COMPLETE_RATIO = 0.9


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


class ContestDetailView(generics.RetrieveAPIView):
    """Full content bundle for the contest detail page. Read-only —
    all CRUD happens in the Django admin."""
    serializer_class = ContestDetailSerializer
    lookup_field = 'name'

    def get_queryset(self):
        return Program.objects.filter(is_active=True).prefetch_related(
            'overview', 'links', 'flow_steps', 'timelines__events',
            'stipend_tiers', 'stipend_phases', 'faqs',
            Prefetch('video_topics', queryset=VideoTopic.objects.prefetch_related('videos')),
        )


@api_view(['GET'])
def video_detail(request, name, topic_slug, video_slug):
    """Single video page: embed url + chapters + prev/next + related, plus the
    requesting user's saved progress and timestamped notes."""
    video = get_object_or_404(
        Video.objects.select_related('topic', 'topic__program').prefetch_related('chapters'),
        slug=video_slug, topic__slug=topic_slug,
        topic__program__name=name, topic__program__is_active=True,
    )
    siblings = list(video.topic.videos.all())
    idx = next((i for i, v in enumerate(siblings) if v.id == video.id), 0)
    prev_v = siblings[idx - 1] if idx > 0 else None
    next_v = siblings[idx + 1] if idx < len(siblings) - 1 else None
    related = [v for v in siblings if v.id != video.id][:6]
    ctx = {'request': request}

    progress = None
    notes = []
    if request.user.is_authenticated:
        p = VideoProgress.objects.filter(user=request.user, video=video).first()
        if p:
            progress = {'position_seconds': p.position_seconds, 'completed': p.completed}
        notes = VideoNoteSerializer(
            VideoNote.objects.filter(user=request.user, video=video), many=True,
        ).data

    return Response({
        'contest': name,
        'video': VideoDetailSerializer(video).data,
        'progress': progress,
        'notes': notes,
        'prev': VideoListItemSerializer(prev_v, context=ctx).data if prev_v else None,
        'next': VideoListItemSerializer(next_v, context=ctx).data if next_v else None,
        'related': VideoListItemSerializer(related, many=True, context=ctx).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_video_progress(request, pk):
    """Upsert the user's watch position. Marks complete at >=90% watched and
    records a one-time activity entry that feeds the streak/activity feed."""
    video = get_object_or_404(Video.objects.select_related('topic', 'topic__program'), pk=pk)
    try:
        position = float(request.data.get('position', 0) or 0)
        duration = float(request.data.get('duration', 0) or 0)
    except (TypeError, ValueError):
        return Response({'error': 'invalid position/duration'}, status=status.HTTP_400_BAD_REQUEST)

    prog, _ = VideoProgress.objects.get_or_create(user=request.user, video=video)
    prog.position_seconds = max(position, 0)
    if duration > 0:
        prog.duration_seconds = duration
    newly_completed = False
    if not prog.completed and duration > 0 and position >= duration * COMPLETE_RATIO:
        prog.completed = True
        newly_completed = True
    prog.save()

    if newly_completed:
        from activity.utils import record_activity
        record_activity(
            user=request.user,
            activity_type='watched_video',
            title=f'watched · {video.topic.program.name} · {video.title}',
            metadata={'video_id': video.id, 'topic': video.topic.slug},
        )

    return Response({'completed': prog.completed, 'position_seconds': prog.position_seconds})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def video_notes(request, pk):
    """List or create the user's timestamped notes for a video."""
    video = get_object_or_404(Video, pk=pk)
    if request.method == 'GET':
        qs = VideoNote.objects.filter(user=request.user, video=video)
        return Response(VideoNoteSerializer(qs, many=True).data)

    body = (request.data.get('body') or '').strip()
    if not body:
        return Response({'error': 'note body required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        ts = int(float(request.data.get('timestamp_seconds', 0) or 0))
    except (TypeError, ValueError):
        ts = 0
    note = VideoNote.objects.create(user=request.user, video=video, timestamp_seconds=max(ts, 0), body=body)
    return Response(VideoNoteSerializer(note).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_video_note(request, pk):
    note = get_object_or_404(VideoNote, pk=pk, user=request.user)
    note.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


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
