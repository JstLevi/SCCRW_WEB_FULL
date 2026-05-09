from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('devices', views.DeviceViewSet, basename='device')
router.register('detections', views.BirdDetectionViewSet, basename='detection')
router.register('activities', views.ActivityLogViewSet, basename='activity')

urlpatterns = [
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/user/', views.current_user, name='current-user'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('', include(router.urls)),
]
