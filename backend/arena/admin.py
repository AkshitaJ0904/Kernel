from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Pattern, Problem, Tag, Submission, Contest, ContestParticipation


@admin.register(Tag)
class TagAdmin(ModelAdmin):
    search_fields = ['name']


@admin.register(Pattern)
class PatternAdmin(ModelAdmin):
    list_display = ['display_name', 'name', 'order']
    list_editable = ['order']
    search_fields = ['name', 'display_name']
    ordering = ['order']


@admin.register(Problem)
class ProblemAdmin(ModelAdmin):
    list_display = ['title', 'pattern', 'difficulty', 'is_active', 'created_at']
    list_filter = ['difficulty', 'pattern', 'is_active']
    search_fields = ['title', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_active']
    filter_horizontal = ['tags']


@admin.register(Submission)
class SubmissionAdmin(ModelAdmin):
    list_display = ['user', 'problem', 'status', 'attempt_number', 'submitted_at']
    list_filter = ['status', 'submitted_at']
    search_fields = ['user__username', 'problem__title']
    readonly_fields = ['submitted_at']


@admin.register(Contest)
class ContestAdmin(ModelAdmin):
    list_display = ['name', 'platform', 'starts_at', 'ends_at', 'problem_count', 'is_active']
    list_filter = ['platform', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ContestParticipation)
class ContestParticipationAdmin(ModelAdmin):
    list_display = ['user', 'contest', 'rank', 'solved_count', 'participated_at']
    list_filter = ['contest']
