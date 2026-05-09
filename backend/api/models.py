from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20, unique=True)
    province = models.CharField(max_length=100)
    municipality = models.CharField(max_length=100, blank=True)
    barangay = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.full_name


class Device(models.Model):
    STATUS_CHOICES = [('online', 'Online'), ('offline', 'Offline')]
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class BirdDetection(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='detections')
    bird_count = models.IntegerField(default=1)
    bird_species = models.CharField(max_length=50, default='unknown')
    confidence_score = models.FloatField(default=0.0)
    detected_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-detected_at']
    
    def __str__(self):
        return f"{self.device.name} - {self.bird_count} birds"


class ActivityLog(models.Model):
    EVENT_TYPES = [('motion', 'Motion'), ('bird', 'Birds'), ('offline', 'Offline'), ('online', 'Online')]
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name='activities')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.device.name} - {self.event_type}"
