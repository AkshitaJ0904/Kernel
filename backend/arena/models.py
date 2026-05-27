from django.db import models
from django.conf import settings


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self) -> str:
        return self.name


class Pattern(models.Model):
    name = models.SlugField(unique=True)
    display_name = models.CharField(max_length=100)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self) -> str:
        return self.display_name


class Problem(models.Model):
    DIFFICULTY = [('easy', 'easy'), ('medium', 'medium'), ('hard', 'hard')]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    pattern = models.ForeignKey(Pattern, on_delete=models.SET_NULL, null=True, related_name='problems')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY)
    description = models.TextField()
    constraints = models.TextField(blank=True)
    examples = models.JSONField(default=list)
    tags = models.ManyToManyField(Tag, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['pattern__order', 'difficulty', 'title']

    def __str__(self) -> str:
        return self.title


class Submission(models.Model):
    STATUS = [
        ('solved', 'solved'),
        ('attempted', 'attempted'),
        ('skipped', 'skipped'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='submissions')
    status = models.CharField(max_length=10, choices=STATUS)
    time_taken_seconds = models.PositiveIntegerField(null=True, blank=True)
    attempt_number = models.PositiveSmallIntegerField(default=1)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self) -> str:
        return f'{self.user.username} · {self.problem.slug} · {self.status}'


class Contest(models.Model):
    PLATFORM = [
        ('leetcode', 'leetcode'),
        ('codeforces', 'codeforces'),
        ('internal', 'internal'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    platform = models.CharField(max_length=20, choices=PLATFORM)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    duration_minutes = models.PositiveSmallIntegerField()
    problem_count = models.PositiveSmallIntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['starts_at']

    def __str__(self) -> str:
        return self.name


class ContestParticipation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contest_participations')
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='participations')
    rank = models.PositiveIntegerField(null=True, blank=True)
    solved_count = models.PositiveSmallIntegerField(default=0)
    participated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'contest']

    def __str__(self) -> str:
        return f'{self.user.username} · {self.contest.name}'
