from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from .models import (
    Program, Org, ProgramOrg, Proposal, UserProgramTracking,
    ContestOverview, OverviewLink, ContestFlowStep, ContestTimeline,
    TimelineEvent, StipendTier, StipendPhase, ContestFAQ, VideoTopic, Video,
    VideoChapter,
)


class ProgramOrgInline(TabularInline):
    model = ProgramOrg
    extra = 1
    fields = ['org', 'year']


class ContestOverviewInline(StackedInline):
    model = ContestOverview
    extra = 0
    can_delete = False


class OverviewLinkInline(TabularInline):
    model = OverviewLink
    extra = 1
    fields = ['label', 'url', 'order']


class ContestFlowStepInline(TabularInline):
    model = ContestFlowStep
    extra = 1
    fields = ['order', 'title', 'description']


class StipendTierInline(TabularInline):
    model = StipendTier
    extra = 1
    fields = ['region', 'amount', 'currency', 'note', 'order']


class StipendPhaseInline(TabularInline):
    model = StipendPhase
    extra = 1
    fields = ['name', 'timing', 'note', 'order']


class ContestFAQInline(TabularInline):
    model = ContestFAQ
    extra = 1
    fields = ['order', 'question', 'answer']


@admin.register(Program)
class ProgramAdmin(ModelAdmin):
    list_display = ['display_name', 'stipend_display', 'deadline_closes_at', 'slots_count', 'acceptance_rate', 'color', 'is_active']
    list_filter = ['is_active', 'color', 'currency']
    list_editable = ['is_active']
    search_fields = ['display_name', 'name']
    prepopulated_fields = {'name': ('display_name',)}
    inlines = [
        ContestOverviewInline, OverviewLinkInline, ContestFlowStepInline,
        StipendTierInline, StipendPhaseInline, ContestFAQInline, ProgramOrgInline,
    ]


class TimelineEventInline(TabularInline):
    model = TimelineEvent
    extra = 1
    fields = ['order', 'title', 'start_date', 'end_date', 'description', 'link_url']


@admin.register(ContestTimeline)
class ContestTimelineAdmin(ModelAdmin):
    list_display = ['program', 'name', 'year', 'is_current']
    list_filter = ['program', 'is_current']
    search_fields = ['name', 'program__display_name']
    inlines = [TimelineEventInline]


class VideoInline(TabularInline):
    model = Video
    extra = 1
    fields = ['order', 'title', 'slug', 'video_url', 'thumbnail_url', 'description']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(VideoTopic)
class VideoTopicAdmin(ModelAdmin):
    list_display = ['program', 'name', 'order']
    list_filter = ['program']
    search_fields = ['name', 'program__display_name']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [VideoInline]


class VideoChapterInline(TabularInline):
    model = VideoChapter
    extra = 1
    fields = ['timestamp_seconds', 'title', 'order']


@admin.register(Video)
class VideoAdmin(ModelAdmin):
    list_display = ['title', 'topic', 'order']
    list_filter = ['topic__program', 'topic']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [VideoChapterInline]


@admin.register(Org)
class OrgAdmin(ModelAdmin):
    list_display = ['name', 'github_url', 'website_url']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = []


@admin.register(Proposal)
class ProposalAdmin(ModelAdmin):
    list_display = ['user', 'program', 'org', 'status', 'version', 'updated_at']
    list_filter = ['status', 'program']
    search_fields = ['user__username', 'title']
    readonly_fields = ['submitted_at', 'updated_at']


@admin.register(UserProgramTracking)
class UserProgramTrackingAdmin(ModelAdmin):
    list_display = ['user', 'program', 'status', 'created_at']
    list_filter = ['program', 'status']
    search_fields = ['user__username']
