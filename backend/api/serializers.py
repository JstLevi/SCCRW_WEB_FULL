from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Device, BirdDetection, ActivityLog


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'full_name', 'contact_number', 'province', 'municipality', 'barangay']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'profile']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    contact_number = serializers.CharField()
    province = serializers.CharField()
    municipality = serializers.CharField(required=False, allow_blank=True)
    barangay = serializers.CharField(required=False, allow_blank=True)
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        UserProfile.objects.create(
            user=user,
            full_name=validated_data['full_name'],
            contact_number=validated_data.get('contact_number', validated_data['username']),
            province=validated_data['province'],
            municipality=validated_data.get('municipality', ''),
            barangay=validated_data.get('barangay', '')
        )
        return user


class DeviceSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.profile.full_name', read_only=True)
    
    class Meta:
        model = Device
        fields = ['id', 'name', 'location', 'is_active', 'status', 'owner_name', 'created_at']
        read_only_fields = ['owner', 'created_at']


class BirdDetectionSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)
    
    class Meta:
        model = BirdDetection
        fields = ['id', 'device', 'device_name', 'bird_count', 'bird_species', 'confidence_score', 'detected_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'device', 'device_name', 'event_type', 'description', 'created_at']