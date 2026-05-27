from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='dashboard'),
    path('public/stats/', views.public_stats, name='public-stats'),
    path('activity/', views.ActivityListView.as_view(), name='activity'),
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/read-all/', views.mark_all_read, name='notifications-read-all'),
    path('notifications/<int:pk>/read/', views.mark_single_read, name='notification-read'),
]
