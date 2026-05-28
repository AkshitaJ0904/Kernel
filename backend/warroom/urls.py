from django.urls import path
from . import views

urlpatterns = [
    path('programs/', views.ProgramListView.as_view(), name='programs'),
    path('programs/<slug:name>/', views.ProgramDetailView.as_view(), name='program-detail'),
    path('contests/<slug:name>/', views.ContestDetailView.as_view(), name='contest-detail'),
    path('contests/<slug:name>/videos/<slug:topic_slug>/<slug:video_slug>/', views.video_detail, name='video-detail'),
    path('orgs/', views.OrgListView.as_view(), name='orgs'),
    path('tracking/', views.toggle_tracking, name='tracking'),
    path('proposals/', views.ProposalListCreateView.as_view(), name='proposals'),
    path('proposals/<int:pk>/', views.ProposalUpdateView.as_view(), name='proposal-update'),
    path('roadmap/', views.roadmap, name='roadmap'),
]
