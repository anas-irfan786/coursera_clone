# analytics/serializers.py
from rest_framework import serializers
from .models import CourseAnalytics
from courses.models import Course
from enrollments.models import Enrollment
from django.db.models import Count, Avg, Sum
from datetime import datetime, timedelta

class CourseAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseAnalytics
        fields = '__all__'

class DashboardStatsSerializer(serializers.Serializer):
    total_courses = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    
class CoursePerformanceSerializer(serializers.Serializer):
    course_id = serializers.UUIDField(source='uuid')
    title = serializers.CharField()
    enrollments = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    average_rating = serializers.FloatField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)

class RevenueAnalyticsSerializer(serializers.Serializer):
    date = serializers.DateField()
    revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    enrollments = serializers.IntegerField()
    
class StudentEngagementSerializer(serializers.Serializer):
    date = serializers.DateField()
    active_students = serializers.IntegerField()
    avg_watch_time = serializers.FloatField()
    completion_rate = serializers.FloatField()