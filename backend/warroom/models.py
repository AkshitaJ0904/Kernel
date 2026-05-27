from django.db import models
from django.conf import settings


class Program(models.Model):
    CURRENCY = [('USD', 'USD'), ('INR', 'INR')]
    COLOR = [('accent', 'accent'), ('warn', 'warn'), ('muted', 'muted')]

    name = models.SlugField(unique=True)
    display_name = models.CharField(max_length=100)
    stipend_min_usd = models.PositiveIntegerField(null=True, blank=True)
    stipend_max_usd = models.PositiveIntegerField(null=True, blank=True)
    stipend_inr = models.PositiveIntegerField(null=True, blank=True)
    currency = models.CharField(max_length=3, choices=CURRENCY, default='USD')
    description = models.TextField(blank=True)
    website_url = models.URLField(blank=True)
    deadline_opens_at = models.DateTimeField(null=True, blank=True)
    deadline_closes_at = models.DateTimeField(null=True, blank=True)
    slots_count = models.PositiveIntegerField(null=True, blank=True)
    acceptance_rate = models.FloatField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    color = models.CharField(max_length=10, choices=COLOR, default='accent')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self) -> str:
        return self.display_name

    @property
    def stipend_display(self) -> str:
        if self.currency == 'INR' and self.stipend_inr:
            return f'₹{self.stipend_inr:,}'
        if self.stipend_min_usd and self.stipend_max_usd:
            return f'${self.stipend_min_usd:,}–${self.stipend_max_usd:,}'
        if self.stipend_min_usd:
            return f'${self.stipend_min_usd:,}'
        return ''

    @property
    def time_remaining_human(self) -> str:
        from django.utils import timezone
        now = timezone.now()
        if self.deadline_closes_at and now < self.deadline_closes_at:
            delta = self.deadline_closes_at - now
            days = delta.days
            hours = delta.seconds // 3600
            if days > 0:
                return f'closes in {days}d {hours}h'
            return f'closes in {hours}h'
        if self.deadline_opens_at and now < self.deadline_opens_at:
            delta = self.deadline_opens_at - now
            return f'opens in {delta.days}d'
        return 'closed'


class Org(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    website_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    stack_tags = models.JSONField(default=list)
    programs = models.ManyToManyField(Program, through='ProgramOrg', blank=True, related_name='orgs')

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class ProgramOrg(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    org = models.ForeignKey(Org, on_delete=models.CASCADE)
    year = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ['program', 'org', 'year']


class Proposal(models.Model):
    STATUS = [
        ('draft', 'draft'),
        ('submitted', 'submitted'),
        ('accepted', 'accepted'),
        ('rejected', 'rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='proposals')
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    org = models.ForeignKey(Org, on_delete=models.CASCADE)
    title = models.CharField(max_length=300)
    content_markdown = models.TextField(blank=True)
    version = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=15, choices=STATUS, default='draft')
    mentor_feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'{self.user.username} · {self.program.name} · v{self.version}'


class UserProgramTracking(models.Model):
    STATUS = [
        ('tracking', 'tracking'),
        ('applied', 'applied'),
        ('accepted', 'accepted'),
        ('rejected', 'rejected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='program_tracking')
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    orgs = models.ManyToManyField(Org, blank=True)
    status = models.CharField(max_length=15, choices=STATUS, default='tracking')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'program']

    def __str__(self) -> str:
        return f'{self.user.username} · {self.program.name} · {self.status}'
