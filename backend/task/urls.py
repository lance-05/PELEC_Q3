from django.urls import path
from .views import TaskList, TaskDetail

urlpatterns = [
    path('api/tasks/', TaskList.as_view(), name='task-list'),
    path('api/tasks/<int:pk>/', TaskDetail.as_view(), name='task-detail'),
]