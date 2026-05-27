from django.urls import path
from . import views

urlpatterns = [
    path('patterns/', views.PatternListView.as_view(), name='patterns'),
    path('problems/', views.ProblemListView.as_view(), name='problems'),
    path('problems/<slug:slug>/', views.ProblemDetailView.as_view(), name='problem-detail'),
    path('problems/<slug:slug>/submit/', views.submit_problem, name='submit-problem'),
    path('daily/', views.daily_queue, name='daily-queue'),
    path('contests/', views.ContestListView.as_view(), name='contests'),
    path('contests/<slug:slug>/join/', views.join_contest, name='join-contest'),
]
