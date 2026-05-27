from rest_framework import serializers
from .models import ActivityEntry, Notification


class ActivityEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityEntry
        fields = ['id', 'type', 'title', 'metadata', 'git_hash', 'created_at']
        read_only_fields = ['id', 'git_hash', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'body', 'read', 'created_at',
                  'related_object_type', 'related_object_id']
        read_only_fields = ['id', 'created_at']
