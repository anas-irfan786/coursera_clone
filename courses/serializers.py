# courses/serializers.py
from rest_framework import serializers
from django.db.models import Avg, Count, Sum, Q
from .models import Course, Section, Lecture, LectureResource, CourseAnnouncement
from enrollments.models import Enrollment, LectureProgress
from assessments.models import Quiz, Assignment
from reviews.models import CourseReview
from payments.models import InstructorEarning
from accounts.serializers import UserSerializer

class LectureResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LectureResource
        fields = ['id', 'uuid', 'title', 'file', 'is_downloadable']

class LectureSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    resources = LectureResourceSerializer(many=True, read_only=True)
    completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Lecture
        fields = ['id', 'title', 'description', 'content_type', 'order', 
                 'video_url', 'video_file', 'video_duration', 'article_content',
                 'is_preview', 'is_downloadable', 'resources', 'completion_rate']
    
    def get_completion_rate(self, obj):
        total = LectureProgress.objects.filter(lecture=obj).count()
        completed = LectureProgress.objects.filter(lecture=obj, is_completed=True).count()
        return (completed / total * 100) if total > 0 else 0

class SectionSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    lectures = LectureSerializer(many=True, read_only=True)
    total_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = ['id', 'title', 'description', 'order', 'is_preview', 
                 'lectures', 'total_duration']
    
    def get_total_duration(self, obj):
        return sum([lecture.video_duration for lecture in obj.lectures.all()])

class CourseListSerializer(serializers.ModelSerializer):
    """Simplified serializer for course listing"""
    id = serializers.UUIDField(source='uuid', read_only=True)
    total_revenue = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'thumbnail', 'status', 'course_type', 'created_at',
                 'total_enrolled', 'average_rating', 'total_revenue', 'is_featured']
    
    def get_total_revenue(self, obj):
        return InstructorEarning.objects.filter(course=obj).aggregate(
            total=Sum('final_amount'))['total'] or 0

class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for course management"""
    id = serializers.UUIDField(source='uuid', read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    language_name = serializers.CharField(source='language.name', read_only=True)
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['uuid', 'total_enrolled', 'total_reviews', 
                           'average_rating', 'published_date']

class CourseCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating courses"""
    class Meta:
        model = Course
        exclude = ['uuid', 'instructor', 'total_enrolled', 'total_reviews', 
                  'average_rating', 'published_date']
    
    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)