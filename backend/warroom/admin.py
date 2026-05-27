from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Program, Org, ProgramOrg, Proposal, UserProgramTracking


class ProgramOrgInline(TabularInline):
    model = ProgramOrg
    extra = 1
    fields = ['org', 'year']


@admin.register(Program)
class ProgramAdmin(ModelAdmin):
    list_display = ['display_name', 'stipend_display', 'deadline_closes_at', 'slots_count', 'acceptance_rate', 'color', 'is_active']
    list_filter = ['is_active', 'color', 'currency']
    list_editable = ['is_active']
    search_fields = ['display_name', 'name']
    prepopulated_fields = {'name': ('display_name',)}
    inlines = [ProgramOrgInline]


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
