from rest_framework import serializers
from .models import Pattern, Problem, Submission, Contest, ContestParticipation, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name']


class PatternSerializer(serializers.ModelSerializer):
    problem_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Pattern
        fields = ['name', 'display_name', 'order', 'problem_count']


class ProblemListSerializer(serializers.ModelSerializer):
    pattern_name = serializers.CharField(source='pattern.display_name', read_only=True)
    pattern_slug = serializers.CharField(source='pattern.name', read_only=True)
    user_status = serializers.SerializerMethodField()
    attempt_count = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = ['id', 'title', 'slug', 'difficulty', 'pattern_name', 'pattern_slug', 'user_status', 'attempt_count']

    def get_user_status(self, obj: Problem) -> str | None:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        sub = obj.submissions.filter(user=request.user).order_by('-submitted_at').first()
        return sub.status if sub else None

    def get_attempt_count(self, obj: Problem) -> int:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.submissions.filter(user=request.user).count()


class ProblemDetailSerializer(serializers.ModelSerializer):
    pattern = PatternSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    user_status = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'slug', 'difficulty', 'pattern', 'description',
            'constraints', 'examples', 'tags', 'user_status', 'created_at',
        ]

    def get_user_status(self, obj: Problem) -> str | None:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        sub = obj.submissions.filter(user=request.user).order_by('-submitted_at').first()
        return sub.status if sub else None


class SubmissionSerializer(serializers.ModelSerializer):
    problem_title = serializers.CharField(source='problem.title', read_only=True)
    problem_slug = serializers.CharField(source='problem.slug', read_only=True)

    class Meta:
        model = Submission
        fields = ['id', 'problem_title', 'problem_slug', 'status', 'time_taken_seconds', 'attempt_number', 'submitted_at']
        read_only_fields = ['id', 'submitted_at', 'attempt_number']


class ContestSerializer(serializers.ModelSerializer):
    time_remaining_human = serializers.SerializerMethodField()
    is_joined = serializers.SerializerMethodField()

    class Meta:
        model = Contest
        fields = ['id', 'name', 'slug', 'platform', 'starts_at', 'ends_at',
                  'duration_minutes', 'problem_count', 'time_remaining_human', 'is_joined']

    def get_time_remaining_human(self, obj: Contest) -> str:
        from django.utils import timezone
        now = timezone.now()
        if now < obj.starts_at:
            delta = obj.starts_at - now
        elif now < obj.ends_at:
            delta = obj.ends_at - now
        else:
            return 'ended'
        days = delta.days
        hours = delta.seconds // 3600
        if days > 0:
            return f'{days}d {hours}h'
        minutes = (delta.seconds % 3600) // 60
        return f'{hours}h {minutes}m'

    def get_is_joined(self, obj: Contest) -> bool:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.participations.filter(user=request.user).exists()
