from django.urls import path
from . import views

urlpatterns = [
    path('tracks/', views.TrackListView.as_view(), name='tracks'),
    path('tracks/<slug:name>/', views.TrackDetailView.as_view(), name='track-detail'),
    path('tracks/<slug:name>/modules/', views.TrackModulesView.as_view(), name='track-modules'),
    path('tracks/<slug:name>/modules/<slug:slug>/', views.ModuleDetailView.as_view(), name='module-detail'),
    path('progress/', views.update_progress, name='workshop-progress'),
]
