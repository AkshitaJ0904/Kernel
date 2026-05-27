from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'streak_current', 'streak_longest', 'streak_last_active',
            'total_solved', 'total_prs_merged', 'total_proposals_submitted',
            'weekday_only_streak',
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'college', 'graduation_year',
            'github_username', 'bio', 'avatar', 'created_at', 'profile',
        ]
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'college', 'graduation_year', 'github_username']

    def create(self, validated_data: dict) -> User:
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            college=validated_data.get('college', ''),
            graduation_year=validated_data.get('graduation_year'),
            github_username=validated_data.get('github_username', ''),
        )
        UserProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data: dict) -> dict:
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('invalid credentials')
        if not user.is_active:
            raise serializers.ValidationError('account disabled')
        data['user'] = user
        return data
