from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin, TabularInline
from .models import User, UserProfile


class UserProfileInline(TabularInline):
    model = UserProfile
    extra = 0
    fields = ['streak_current', 'streak_longest', 'total_solved', 'total_prs_merged']


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    list_display = ['username', 'email', 'college', 'graduation_year', 'is_active', 'created_at']
    list_filter = ['is_active', 'graduation_year', 'created_at']
    search_fields = ['username', 'email', 'github_username', 'college']
    ordering = ['-created_at']
    inlines = [UserProfileInline]
    fieldsets = BaseUserAdmin.fieldsets + (
        ('kernel/ profile', {
            'fields': ('college', 'graduation_year', 'github_username', 'bio', 'avatar')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(ModelAdmin):
    list_display = ['user', 'streak_current', 'streak_longest', 'total_solved', 'total_prs_merged']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['streak_last_active']
