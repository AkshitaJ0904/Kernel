import random
import string
from django.db import models
from django.conf import settings


def _gen_hash() -> str:
    return ''.join(random.choices(string.hexdigits[:16], k=7))


class ActivityEntry(models.Model):
    TYPES = [
        ('solved', 'solved'),
        ('started_module', 'started module'),
        ('opened_pr', 'opened pr'),
        ('draft_proposal', 'draft proposal'),
        ('streak_milestone', 'streak milestone'),
        ('contest_entry', 'contest entry'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity')
    type = models.CharField(max_length=20, choices=TYPES)
    title = models.CharField(max_length=300)
    metadata = models.JSONField(default=dict)
    git_hash = models.CharField(max_length=8, default=_gen_hash, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.user.username} · {self.title}'


class Notification(models.Model):
    TYPE = [('info', 'info'), ('warn', 'warn'), ('unread', 'unread')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=10, choices=TYPE, default='info')
    title = models.CharField(max_length=200)
    body = models.TextField()
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'{self.user.username} · {self.title}'
