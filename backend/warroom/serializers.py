from rest_framework import serializers
from .models import Program, Org, Proposal, UserProgramTracking


class ProgramSerializer(serializers.ModelSerializer):
    stipend_display = serializers.CharField(read_only=True)
    time_remaining_human = serializers.CharField(read_only=True)
    is_tracked = serializers.SerializerMethodField()
    org_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Program
        fields = [
            'id', 'name', 'display_name', 'stipend_display', 'stipend_min_usd',
            'stipend_max_usd', 'stipend_inr', 'currency', 'description',
            'website_url', 'deadline_opens_at', 'deadline_closes_at',
            'slots_count', 'acceptance_rate', 'is_active', 'color',
            'time_remaining_human', 'is_tracked', 'org_count',
        ]

    def get_is_tracked(self, obj: Program) -> bool:
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return UserProgramTracking.objects.filter(user=request.user, program=obj).exists()


class OrgSerializer(serializers.ModelSerializer):
    class Meta:
        model = Org
        fields = ['id', 'name', 'slug', 'description', 'website_url', 'github_url', 'stack_tags']


class ProposalSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.display_name', read_only=True)
    org_name = serializers.CharField(source='org.name', read_only=True)

    class Meta:
        model = Proposal
        fields = [
            'id', 'program', 'program_name', 'org', 'org_name', 'title',
            'content_markdown', 'version', 'status', 'mentor_feedback',
            'submitted_at', 'updated_at',
        ]
        read_only_fields = ['id', 'updated_at', 'mentor_feedback']


class UserProgramTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgramTracking
        fields = ['program', 'orgs', 'status']
