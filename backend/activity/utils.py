from datetime import date, timedelta
from django.utils import timezone
from django.conf import settings


def record_activity(user, activity_type: str, title: str, metadata: dict) -> None:
    from .models import ActivityEntry
    ActivityEntry.objects.create(user=user, type=activity_type, title=title, metadata=metadata)


def update_streak(user) -> None:
    """Update streak_current and streak_longest on the user's profile."""
    profile = user.profile
    today = timezone.now().date()
    last_active = profile.streak_last_active

    if last_active == today:
        return

    if last_active is None:
        profile.streak_current = 1
    elif profile.weekday_only_streak:
        # count only business days between last_active and today
        days_gap = _weekday_gap(last_active, today)
        if days_gap == 1:
            profile.streak_current += 1
        elif days_gap > 1:
            profile.streak_current = 1
    else:
        if today - last_active == timedelta(days=1):
            profile.streak_current += 1
        elif today - last_active > timedelta(days=1):
            profile.streak_current = 1

    profile.streak_last_active = today
    if profile.streak_current > profile.streak_longest:
        profile.streak_longest = profile.streak_current

    profile.save(update_fields=['streak_current', 'streak_longest', 'streak_last_active'])

    if profile.streak_current % 7 == 0:
        from .models import Notification
        Notification.objects.create(
            user=user,
            type='info',
            title=f'streak: {profile.streak_current}d',
            body=f'{profile.streak_current} day streak. keep going.',
        )


def _weekday_gap(start: date, end: date) -> int:
    """Count weekday transitions between start and end (exclusive start, inclusive end)."""
    gap = 0
    current = start
    while current < end:
        current += timedelta(days=1)
        if current.weekday() < 5:
            gap += 1
    return gap


def build_heatmap(user, year: int) -> dict:
    """Return heatmap data: 53 weeks × 7 days with contribution counts."""
    from .models import ActivityEntry
    from datetime import datetime
    import collections

    start = date(year, 1, 1)
    # align to Monday of the first week
    week_start = start - timedelta(days=start.weekday())
    end = week_start + timedelta(weeks=53)

    entries = ActivityEntry.objects.filter(
        user=user,
        created_at__date__gte=week_start,
        created_at__date__lt=end,
    ).values_list('created_at__date', flat=True)

    counts: dict[date, int] = collections.Counter(entries)

    weeks = []
    current = week_start
    for _ in range(53):
        week = []
        for d in range(7):
            day = current + timedelta(days=d)
            week.append({'date': str(day), 'count': counts.get(day, 0)})
        weeks.append(week)
        current += timedelta(weeks=1)

    return {'year': year, 'weeks': weeks}
