from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import ActivityEntry, Notification
from .serializers import ActivityEntrySerializer, NotificationSerializer
from .utils import build_heatmap


class ActivityListView(generics.ListAPIView):
    serializer_class = ActivityEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ActivityEntry.objects.filter(user=self.request.user)


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_stats(request):
    from django.contrib.auth import get_user_model
    from django.db.models import Sum
    from warroom.models import Proposal
    UserModel = get_user_model()
    contributors = UserModel.objects.filter(is_active=True).count()
    prs_merged = UserModel.objects.aggregate(total=Sum('profile__total_prs_merged'))['total'] or 0
    stipends_earned = Proposal.objects.filter(status='accepted').count()
    return Response({
        'contributors': contributors,
        'prs_merged': prs_merged,
        'stipends_earned': stipends_earned,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    Notification.objects.filter(user=request.user, read=False).update(read=True)
    return Response({'marked_read': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_single_read(request, pk: int):
    updated = Notification.objects.filter(pk=pk, user=request.user).update(read=True)
    if not updated:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response({'marked_read': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    from arena.models import Problem, Contest
    from arena.serializers import ProblemListSerializer, ContestSerializer
    from warroom.models import UserProgramTracking, Program
    from warroom.serializers import ProgramSerializer
    from accounts.serializers import UserSerializer
    from django.db.models import Count
    from random import seed, sample

    user = request.user
    profile = user.profile

    # today's queue
    today = timezone.now().date()
    seed(str(user.id) + str(today))
    solved_ids = list(user.submissions.filter(status='solved').values_list('problem_id', flat=True))
    unsolved = list(Problem.objects.filter(is_active=True).exclude(id__in=solved_ids).values_list('id', flat=True))
    if len(unsolved) >= 5:
        selected_ids = sample(unsolved, 5)
    else:
        all_ids = list(Problem.objects.filter(is_active=True).values_list('id', flat=True))
        selected_ids = sample(all_ids, min(5, len(all_ids)))
    daily_problems = Problem.objects.filter(id__in=selected_ids).select_related('pattern')

    # upcoming contests
    contests = Contest.objects.filter(is_active=True, ends_at__gte=timezone.now())[:5]

    # tracked programs
    tracked = UserProgramTracking.objects.filter(user=user).select_related('program')[:5]
    programs_data = ProgramSerializer(
        [t.program for t in tracked],
        many=True,
        context={'request': request}
    ).data

    # recent notifications
    notifs = Notification.objects.filter(user=user)[:5]

    # heatmap
    heatmap = build_heatmap(user, today.year)

    # pattern coverage
    from arena.models import Pattern, Submission
    patterns = Pattern.objects.annotate(total=Count('problems')).order_by('order')[:12]
    pattern_coverage = []
    for pat in patterns:
        total = pat.total
        solved = Submission.objects.filter(
            user=user, problem__pattern=pat, status='solved'
        ).values('problem').distinct().count()
        pattern_coverage.append({
            'name': pat.display_name,
            'solved': solved,
            'total': total,
            'pct': round(solved / total * 100) if total else 0,
        })

    # unread count
    unread_count = Notification.objects.filter(user=user, read=False).count()

    # public stats (also used on landing page)
    from django.contrib.auth import get_user_model
    UserModel = get_user_model()
    from arena.models import Submission as Sub
    from warroom.models import Proposal

    from django.db.models import Sum
    total_users = UserModel.objects.filter(is_active=True).count()
    total_prs = UserModel.objects.aggregate(total=Sum('profile__total_prs_merged'))['total'] or 0
    total_stipends = Proposal.objects.filter(status='accepted').count()

    return Response({
        'user': UserSerializer(user).data,
        'stats': {
            'problems_solved': profile.total_solved,
            'streak_current': profile.streak_current,
            'streak_longest': profile.streak_longest,
            'prs_merged': profile.total_prs_merged,
            'proposals_submitted': profile.total_proposals_submitted,
            'unread_notifications': unread_count,
        },
        'public_stats': {
            'contributors': total_users,
            'prs_merged': total_prs,
            'stipends_earned': total_stipends,
        },
        'daily_queue': ProblemListSerializer(daily_problems, many=True, context={'request': request}).data,
        'contests': ContestSerializer(contests, many=True, context={'request': request}).data,
        'tracked_programs': programs_data,
        'notifications': NotificationSerializer(notifs, many=True).data,
        'heatmap': heatmap,
        'pattern_coverage': pattern_coverage,
        'recent_activity': ActivityEntrySerializer(
            ActivityEntry.objects.filter(user=user)[:10], many=True
        ).data,
    })
