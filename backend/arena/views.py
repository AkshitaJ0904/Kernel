from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Pattern, Problem, Submission, Contest, ContestParticipation
from .serializers import (
    PatternSerializer, ProblemListSerializer, ProblemDetailSerializer,
    SubmissionSerializer, ContestSerializer,
)
from activity.utils import record_activity, update_streak


class PatternListView(generics.ListAPIView):
    serializer_class = PatternSerializer
    queryset = Pattern.objects.annotate(problem_count=Count('problems'))


class ProblemListView(generics.ListAPIView):
    serializer_class = ProblemListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['difficulty', 'pattern__name']
    search_fields = ['title']

    def get_queryset(self):
        return Problem.objects.filter(is_active=True).select_related('pattern')


class ProblemDetailView(generics.RetrieveAPIView):
    serializer_class = ProblemDetailSerializer
    lookup_field = 'slug'
    queryset = Problem.objects.filter(is_active=True)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_problem(request, slug: str):
    problem = get_object_or_404(Problem, slug=slug, is_active=True)
    attempt_num = Submission.objects.filter(user=request.user, problem=problem).count() + 1
    serializer = SubmissionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    sub = Submission.objects.create(
        user=request.user,
        problem=problem,
        status=serializer.validated_data['status'],
        time_taken_seconds=serializer.validated_data.get('time_taken_seconds'),
        attempt_number=attempt_num,
    )
    if sub.status == 'solved':
        profile = request.user.profile
        profile.total_solved += 1
        profile.save(update_fields=['total_solved'])
        record_activity(
            user=request.user,
            activity_type='solved',
            title=f'solved · {problem.pattern.name}/{problem.slug}',
            metadata={'problem_id': problem.id, 'time_taken': sub.time_taken_seconds, 'attempt': attempt_num},
        )
        update_streak(request.user)
    return Response(SubmissionSerializer(sub).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_queue(request):
    from random import seed, sample
    today = timezone.now().date()
    seed(str(request.user.id) + str(today))
    solved_ids = Submission.objects.filter(
        user=request.user, status='solved'
    ).values_list('problem_id', flat=True)
    unsolved = list(Problem.objects.filter(is_active=True).exclude(id__in=solved_ids).values_list('id', flat=True))
    if len(unsolved) >= 5:
        selected_ids = sample(unsolved, 5)
    else:
        all_ids = list(Problem.objects.filter(is_active=True).values_list('id', flat=True))
        selected_ids = sample(all_ids, min(5, len(all_ids)))
    problems = Problem.objects.filter(id__in=selected_ids).select_related('pattern')
    return Response(ProblemListSerializer(problems, many=True, context={'request': request}).data)


class ContestListView(generics.ListAPIView):
    serializer_class = ContestSerializer

    def get_queryset(self):
        return Contest.objects.filter(is_active=True, ends_at__gte=timezone.now())


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_contest(request, slug: str):
    contest = get_object_or_404(Contest, slug=slug, is_active=True)
    participation, created = ContestParticipation.objects.get_or_create(
        user=request.user, contest=contest
    )
    if created:
        record_activity(
            user=request.user,
            activity_type='contest_entry',
            title=f'contest · {contest.name}',
            metadata={'contest_id': contest.id},
        )
    return Response({'joined': True, 'created': created})
