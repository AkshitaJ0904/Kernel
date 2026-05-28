import re
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


# ── Contest detail content ──────────────────────────────────────────────
# Everything below hangs off Program (the "contest card"). Adding a new
# contest = create a Program + content rows in the admin. No code changes.


class ContestOverview(models.Model):
    program = models.OneToOneField(Program, on_delete=models.CASCADE, related_name='overview')
    description_long = models.TextField(blank=True, help_text='markdown · full description')
    objective = models.TextField(blank=True, help_text='markdown')
    eligibility = models.TextField(blank=True, help_text='markdown')
    registration_process = models.TextField(blank=True, help_text='markdown')
    prerequisites = models.TextField(blank=True, help_text='markdown')

    def __str__(self) -> str:
        return f'{self.program.name} · overview'


class OverviewLink(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='links')
    label = models.CharField(max_length=120)
    url = models.URLField()
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self) -> str:
        return self.label


class ContestFlowStep(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='flow_steps')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, help_text='markdown')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self) -> str:
        return f'{self.program.name} · step {self.order}: {self.title}'


class ContestTimeline(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='timelines')
    name = models.CharField(max_length=120, help_text='e.g. "2026 timeline"')
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    is_current = models.BooleanField(default=True, help_text='shown first / by default')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['-is_current', '-year', 'order']

    def __str__(self) -> str:
        return f'{self.program.name} · {self.name}'


class TimelineEvent(models.Model):
    timeline = models.ForeignKey(ContestTimeline, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    link_url = models.URLField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'start_date']

    def __str__(self) -> str:
        return self.title


class StipendTier(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='stipend_tiers')
    region = models.CharField(max_length=120, blank=True, help_text='country / region, blank = global')
    amount = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, choices=Program.CURRENCY, default='USD')
    note = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self) -> str:
        return f'{self.program.name} · {self.region or "global"} · {self.amount}'


class StipendPhase(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='stipend_phases')
    name = models.CharField(max_length=120, help_text='e.g. "phase 1 — midterm"')
    timing = models.CharField(max_length=120, blank=True, help_text='e.g. "after midterm evaluation"')
    note = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self) -> str:
        return f'{self.program.name} · {self.name}'


class ContestFAQ(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=300)
    answer = models.TextField(help_text='markdown')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = 'Contest FAQ'

    def __str__(self) -> str:
        return self.question


class VideoTopic(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='video_topics')
    name = models.CharField(max_length=160)
    slug = models.SlugField()
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['program', 'slug']

    def __str__(self) -> str:
        return f'{self.program.name} · {self.name}'


class Video(models.Model):
    topic = models.ForeignKey(VideoTopic, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    slug = models.SlugField()
    description = models.TextField(blank=True, help_text='markdown')
    video_url = models.URLField(help_text='paste any video link — youtube, vimeo, google drive, or a direct .mp4')
    thumbnail_url = models.URLField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ['topic', 'slug']

    def __str__(self) -> str:
        return self.title

    @property
    def embed_url(self) -> str:
        """Normalize a video link into an embeddable URL.

        Watch/share pages cannot be iframed directly, so convert them:
          youtube.com/watch?v=<ID> · youtu.be/<ID> · shorts/<ID> → youtube.com/embed/<ID>
          vimeo.com/<ID>                                          → player.vimeo.com/video/<ID>
          drive.google.com/file/d/<ID>/view                       → .../file/d/<ID>/preview
        Already-embeddable links and direct files (.mp4) are returned unchanged.
        """
        url = (self.video_url or '').strip()

        yt = re.search(r'(?:youtube\.com/(?:watch\?v=|embed/|shorts/|live/|v/)|youtu\.be/)([\w-]{11})', url)
        if yt:
            return f'https://www.youtube.com/embed/{yt.group(1)}'

        vm = re.search(r'vimeo\.com/(?:video/)?(\d+)', url)
        if vm:
            return f'https://player.vimeo.com/video/{vm.group(1)}'

        gd = re.search(r'/file/d/([^/]+)', url) or re.search(r'[?&]id=([^&]+)', url)
        if gd:
            return f'https://drive.google.com/file/d/{gd.group(1)}/preview'

        return url

    @property
    def is_direct_file(self) -> bool:
        """Direct media files should use a native <video> tag, not an iframe."""
        return bool(re.search(r'\.(mp4|webm|ogg)(\?|$)', (self.video_url or ''), re.I))


class VideoChapter(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='chapters')
    timestamp_seconds = models.PositiveIntegerField(help_text='start time of this chapter, in seconds')
    title = models.CharField(max_length=200)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['timestamp_seconds', 'order']

    def __str__(self) -> str:
        return f'{self.video.slug} · {self.timestamp_seconds}s · {self.title}'


class VideoProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_progress')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='progress')
    position_seconds = models.FloatField(default=0)
    duration_seconds = models.FloatField(default=0)
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'video']

    def __str__(self) -> str:
        return f'{self.user.username} · {self.video.slug} · {"done" if self.completed else int(self.position_seconds)}'


class VideoNote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_notes')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='notes')
    timestamp_seconds = models.PositiveIntegerField(default=0)
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp_seconds']

    def __str__(self) -> str:
        return f'{self.user.username} · {self.video.slug} @ {self.timestamp_seconds}s'


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
