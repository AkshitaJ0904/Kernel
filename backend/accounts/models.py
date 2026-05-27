from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    college = models.CharField(max_length=200, blank=True)
    graduation_year = models.PositiveSmallIntegerField(null=True, blank=True)
    github_username = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True, max_length=500)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self) -> str:
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    streak_current = models.PositiveIntegerField(default=0)
    streak_longest = models.PositiveIntegerField(default=0)
    streak_last_active = models.DateField(null=True, blank=True)
    total_solved = models.PositiveIntegerField(default=0)
    total_prs_merged = models.PositiveIntegerField(default=0)
    total_proposals_submitted = models.PositiveIntegerField(default=0)
    weekday_only_streak = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f'{self.user.username} profile'
