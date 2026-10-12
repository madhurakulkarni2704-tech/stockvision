
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

        UserProfile.objects.create(
            user=user,
            role='SHOPKEEPER'
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(
        source='userprofile.role',
        read_only=True
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'role']


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=UserProfile.ROLE_CHOICES,
        source='userprofile.role'
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id', 'username', 'email']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('userprofile', {})
        role = profile_data.get('role')

        if role:
            instance.userprofile.role = role
            instance.userprofile.save(update_fields=['role'])

        return instance

