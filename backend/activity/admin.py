from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import ActivityEntry, Notification


@admin.register(ActivityEntry)
class ActivityEntryAdmin(ModelAdmin):
    list_display = ['user', 'type', 'title', 'git_hash', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['user__username', 'title']
    readonly_fields = ['git_hash', 'created_at']


@admin.register(Notification)
class NotificationAdmin(ModelAdmin):
    list_display = ['user', 'type', 'title', 'read', 'created_at']
    list_filter = ['type', 'read']
    search_fields = ['user__username', 'title', 'body']
    list_editable = ['read']
    readonly_fields = ['created_at']

    actions = ['mark_read', 'broadcast_notification']

    @admin.action(description='mark selected as read')
    def mark_read(self, request, queryset):
        queryset.update(read=True)

    @admin.action(description='broadcast: create copy for all active users')
    def broadcast_notification(self, request, queryset):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users = User.objects.filter(is_active=True)
        to_create = []
        for notif in queryset:
            for user in users:
                to_create.append(Notification(
                    user=user, type=notif.type,
                    title=notif.title, body=notif.body,
                ))
        Notification.objects.bulk_create(to_create, ignore_conflicts=True)
