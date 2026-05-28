from rest_framework import serializers
from .models import (
    Program, Org, Proposal, UserProgramTracking,
    ContestOverview, OverviewLink, ContestFlowStep, ContestTimeline,
    TimelineEvent, StipendTier, StipendPhase, ContestFAQ, VideoTopic, Video,
    VideoChapter, VideoProgress, VideoNote,
)


def _completed_video_ids(context):
    """Set of video ids the requesting user has completed (empty if anon)."""
    request = context.get('request')
    if not request or not request.user.is_authenticated:
        return set()
    cache = context.setdefault('_completed_ids', None)
    if cache is None:
        cache = set(VideoProgress.objects.filter(
            user=request.user, completed=True,
        ).values_list('video_id', flat=True))
        context['_completed_ids'] = cache
    return cache


class ProgramSerializer(serializers.ModelSerializer):
    stipend_display = serializers.CharField(read_only=True)
    time_remaining_human = serializers.CharField(read_only=True)
    is_tracked = serializers.SerializerMethodField()
    org_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'display_name', 'stipend_display', 'stipend_min_usd',
            'stipend_max_usd', 'stipend_inr', 'currency', 'description',
            'website_url', 'deadline_opens_at', 'deadline_closes_at',
            'slots_count', 'acceptance_rate', 'is_active', 'color',
            'time_remaining_human', 'is_tracked', 'org_count',
        ]

    def get_is_tracked(self, obj: Program) -> bool:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return UserProgramTracking.objects.filter(user=request.user, program=obj).exists()


class OrgSerializer(serializers.ModelSerializer):
    class Meta:
        model = Org
        fields = ['id', 'name', 'slug', 'description', 'website_url', 'github_url', 'stack_tags']


class ProposalSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.display_name', read_only=True)
    org_name = serializers.CharField(source='org.name', read_only=True)

    class Meta:
        model = Proposal
        fields = [
            'id', 'program', 'program_name', 'org', 'org_name', 'title',
            'content_markdown', 'version', 'status', 'mentor_feedback',
            'submitted_at', 'updated_at',
        ]
        read_only_fields = ['id', 'updated_at', 'mentor_feedback']


class UserProgramTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgramTracking
        fields = ['program', 'orgs', 'status']


# ── Contest detail content ──────────────────────────────────────────────


class ContestOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestOverview
        fields = ['description_long', 'objective', 'eligibility', 'registration_process', 'prerequisites']


class OverviewLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = OverviewLink
        fields = ['id', 'label', 'url']


class ContestFlowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestFlowStep
        fields = ['id', 'title', 'description', 'order']


class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = ['id', 'title', 'start_date', 'end_date', 'description', 'link_url', 'order']


class ContestTimelineSerializer(serializers.ModelSerializer):
    events = TimelineEventSerializer(many=True, read_only=True)

    class Meta:
        model = ContestTimeline
        fields = ['id', 'name', 'year', 'is_current', 'events']


class StipendTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = StipendTier
        fields = ['id', 'region', 'amount', 'currency', 'note']


class StipendPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StipendPhase
        fields = ['id', 'name', 'timing', 'note']


class ContestFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestFAQ
        fields = ['id', 'question', 'answer']


class VideoChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoChapter
        fields = ['id', 'timestamp_seconds', 'title']


class VideoNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoNote
        fields = ['id', 'timestamp_seconds', 'body', 'created_at']
        read_only_fields = ['id', 'created_at']


class VideoListItemSerializer(serializers.ModelSerializer):
    """Lightweight video entry for the sidebar tree (no embed)."""
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['id', 'title', 'slug', 'thumbnail_url', 'order', 'completed']

    def get_completed(self, obj: Video) -> bool:
        return obj.id in _completed_video_ids(self.context)


class VideoTopicSerializer(serializers.ModelSerializer):
    videos = VideoListItemSerializer(many=True, read_only=True)

    class Meta:
        model = VideoTopic
        fields = ['id', 'name', 'slug', 'videos']


class VideoDetailSerializer(serializers.ModelSerializer):
    embed_url = serializers.CharField(read_only=True)
    is_direct_file = serializers.BooleanField(read_only=True)
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    topic_slug = serializers.CharField(source='topic.slug', read_only=True)
    chapters = VideoChapterSerializer(many=True, read_only=True)

    class Meta:
        model = Video
        fields = ['id', 'title', 'slug', 'description', 'video_url', 'embed_url',
                  'is_direct_file', 'thumbnail_url', 'topic_name', 'topic_slug', 'chapters']


class ContestDetailSerializer(serializers.ModelSerializer):
    """Aggregate payload for the contest detail page. Drives both content
    panes and the auto-derived sidebar (a section appears when it has data)."""
    stipend_display = serializers.CharField(read_only=True)
    time_remaining_human = serializers.CharField(read_only=True)
    overview = ContestOverviewSerializer(read_only=True)
    links = OverviewLinkSerializer(many=True, read_only=True)
    flow_steps = ContestFlowStepSerializer(many=True, read_only=True)
    timelines = ContestTimelineSerializer(many=True, read_only=True)
    stipend_tiers = StipendTierSerializer(many=True, read_only=True)
    stipend_phases = StipendPhaseSerializer(many=True, read_only=True)
    faqs = ContestFAQSerializer(many=True, read_only=True)
    video_topics = VideoTopicSerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'display_name', 'description', 'website_url', 'color',
            'stipend_display', 'time_remaining_human', 'deadline_opens_at',
            'deadline_closes_at', 'overview', 'links', 'flow_steps', 'timelines',
            'stipend_tiers', 'stipend_phases', 'faqs', 'video_topics',
        ]
