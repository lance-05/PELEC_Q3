from rest_framework import serializers
from .models import Task
from django.utils import timezone

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'is_completed', 'due_date', 'created_at']

    def validate_due_date(self, value):
        if value and value < timezone.now().date():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value