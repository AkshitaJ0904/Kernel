from rest_framework import serializers
from .models import Track, Module, Project, UserProgress


class ModuleSerializer(serializers.ModelSerializer):
    user_status = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ['id', 'title', 'slug', 'order', 'estimated_minutes', 'content_markdown', 'user_status']

    def get_user_status(self, obj: Module) -> str:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'not_started'
        prog = obj.progress.filter(user=request.user).first()
        return prog.status if prog else 'not_started'


class ProjectSerializer(serializers.ModelSerializer):
    user_status = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'slug', 'difficulty', 'description', 'repo_template_url', 'user_status']

    def get_user_status(self, obj: Project) -> str:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'not_started'
        prog = obj.progress.filter(user=request.user).first()
        return prog.status if prog else 'not_started'


class TrackSerializer(serializers.ModelSerializer):
    module_count = serializers.IntegerField(read_only=True)
    completed_count = serializers.SerializerMethodField()

    class Meta:
        model = Track
        fields = ['id', 'name', 'display_name', 'language', 'description', 'order', 'module_count', 'completed_count']

    def get_completed_count(self, obj: Track) -> int:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return UserProgress.objects.filter(
            user=request.user, module__track=obj, status='completed'
        ).count()


class TrackDetailSerializer(TrackSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)

    class Meta(TrackSerializer.Meta):
        fields = TrackSerializer.Meta.fields + ['modules', 'projects']


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ['module', 'project', 'status']
