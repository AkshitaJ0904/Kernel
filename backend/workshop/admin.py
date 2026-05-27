from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Track, Module, Project, UserProgress


class ModuleInline(TabularInline):
    model = Module
    extra = 1
    fields = ['title', 'slug', 'order', 'estimated_minutes']


class ProjectInline(TabularInline):
    model = Project
    extra = 1
    fields = ['title', 'slug', 'difficulty', 'order']


@admin.register(Track)
class TrackAdmin(ModelAdmin):
    list_display = ['display_name', 'language', 'order']
    list_editable = ['order']
    inlines = [ModuleInline, ProjectInline]
    prepopulated_fields = {'name': ('display_name',)}


@admin.register(Module)
class ModuleAdmin(ModelAdmin):
    list_display = ['title', 'track', 'order', 'estimated_minutes']
    list_filter = ['track']
    search_fields = ['title']


@admin.register(Project)
class ProjectAdmin(ModelAdmin):
    list_display = ['title', 'track', 'difficulty', 'order']
    list_filter = ['track', 'difficulty']


@admin.register(UserProgress)
class UserProgressAdmin(ModelAdmin):
    list_display = ['user', 'module', 'project', 'status', 'started_at', 'completed_at']
    list_filter = ['status']
    search_fields = ['user__username']
