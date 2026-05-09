from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Device, BirdDetection, ActivityLog


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'


class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'get_full_name', 'get_contact_number', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'profile__full_name', 'profile__contact_number')
    
    def get_full_name(self, obj):
        return obj.profile.full_name if hasattr(obj, 'profile') else '-'
    get_full_name.short_description = 'Full Name'
    
    def get_contact_number(self, obj):
        return obj.profile.contact_number if hasattr(obj, 'profile') else '-'
    get_contact_number.short_description = 'Contact Number'


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'contact_number', 'province', 'created_at']
    search_fields = ['full_name', 'contact_number']
    raw_id_fields = ['user']


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'location', 'status', 'is_active', 'created_at']
    list_filter = ['status', 'is_active']
    search_fields = ['name', 'location']
    raw_id_fields = ['owner']


@admin.register(BirdDetection)
class BirdDetectionAdmin(admin.ModelAdmin):
    list_display = ['device', 'bird_count', 'bird_species', 'confidence_score', 'detected_at']
    list_filter = ['bird_species', 'detected_at']
    search_fields = ['bird_species', 'device__name']
    date_hierarchy = 'detected_at'
    raw_id_fields = ['device']


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['device', 'event_type', 'description', 'created_at']
    list_filter = ['event_type', 'created_at']
    search_fields = ['description', 'device__name']
    date_hierarchy = 'created_at'
    raw_id_fields = ['device']


# Re-register User model with custom admin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)