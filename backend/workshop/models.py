from django.db import models
from django.conf import settings


class Track(models.Model):
    name = models.SlugField(unique=True)
    display_name = models.CharField(max_length=100)
    language = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self) -> str:
        return self.display_name


class Module(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    slug = models.SlugField()
    order = models.PositiveSmallIntegerField(default=0)
    content_markdown = models.TextField(blank=True)
    estimated_minutes = models.PositiveSmallIntegerField(default=30)

    class Meta:
        ordering = ['order']
        unique_together = ['track', 'slug']

    def __str__(self) -> str:
        return f'{self.track.name} · {self.title}'


class Project(models.Model):
    DIFFICULTY = [('easy', 'easy'), ('medium', 'medium'), ('hard', 'hard')]

    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    slug = models.SlugField()
    description = models.TextField(blank=True)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY)
    repo_template_url = models.URLField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['track', 'slug']

    def __str__(self) -> str:
        return self.title


class UserProgress(models.Model):
    STATUS = [
        ('not_started', 'not started'),
        ('in_progress', 'in progress'),
        ('completed', 'completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workshop_progress')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, null=True, blank=True, related_name='progress')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='progress')
    status = models.CharField(max_length=15, choices=STATUS, default='not_started')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [['user', 'module'], ['user', 'project']]

    def __str__(self) -> str:
        item = self.module or self.project
        return f'{self.user.username} · {item} · {self.status}'
