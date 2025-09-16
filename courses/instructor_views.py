# courses/instructor_views.py
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum, Q
from datetime import datetime, timedelta
from django.utils import timezone

from .models import Course, Section, Lecture, CourseAnnouncement
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseCreateSerializer,
    SectionSerializer, LectureSerializer
)
from enrollments.models import Enrollment
from payments.models import InstructorEarning, Payment
from reviews.models import CourseReview
from analytics.models import CourseAnalytics

class IsInstructor(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.user_type == 'instructor'

class InstructorCourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsInstructor]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CourseCreateSerializer
        return CourseDetailSerializer
    
    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)
    
    def get_object(self):
        return get_object_or_404(Course, uuid=self.kwargs['pk'], instructor=self.request.user)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a course"""
        course = self.get_object()
        if course.sections.count() == 0:
            return Response({'error': 'Course must have at least one section'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        course.status = 'published'
        course.published_date = timezone.now()
        course.save()
        return Response({'status': 'Course published successfully'})
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Unpublish a course"""
        course = self.get_object()
        course.status = 'unpublished'
        course.save()
        return Response({'status': 'Course unpublished successfully'})

    

    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get enrolled students for a course"""
        course = self.get_object()
        enrollments = Enrollment.objects.filter(course=course).select_related('student')
        
        data = []
        for enrollment in enrollments:
            data.append({
                'student_id': enrollment.student.uuid,
                'name': enrollment.student.get_full_name(),
                'email': enrollment.student.email,
                'enrolled_date': enrollment.enrolled_date,
                'progress': enrollment.progress_percentage,
                'last_accessed': enrollment.last_accessed,
                'status': enrollment.status
            })
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get course analytics"""
        course = self.get_object()
        
        # Calculate analytics
        total_students = Enrollment.objects.filter(course=course).count()
        active_students = Enrollment.objects.filter(
            course=course, 
            last_accessed__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        completion_rate = Enrollment.objects.filter(
            course=course, status='completed'
        ).count() / total_students * 100 if total_students > 0 else 0
        
        avg_progress = Enrollment.objects.filter(
            course=course
        ).aggregate(Avg('progress_percentage'))['progress_percentage__avg'] or 0
        
        total_revenue = InstructorEarning.objects.filter(
            course=course
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        # Get recent reviews
        recent_reviews = CourseReview.objects.filter(
            course=course
        ).order_by('-created_at')[:5].values(
            'student__first_name', 'student__last_name', 
            'rating', 'title', 'comment', 'created_at'
        )
        
        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'completion_rate': completion_rate,
            'average_progress': avg_progress,
            'total_revenue': total_revenue,
            'average_rating': course.average_rating,
            'total_reviews': course.total_reviews,
            'recent_reviews': recent_reviews
        })

class InstructorDashboardView(generics.GenericAPIView):
    permission_classes = [IsInstructor]
    
    def get(self, request):
        instructor = request.user
        
        # Overall stats
        courses = Course.objects.filter(instructor=instructor)
        total_students = Enrollment.objects.filter(
            course__instructor=instructor
        ).values('student').distinct().count()
        
        total_revenue = InstructorEarning.objects.filter(
            instructor=instructor
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        avg_rating = courses.aggregate(
            Avg('average_rating'))['average_rating__avg'] or 0
        
        # Recent activity
        recent_enrollments = Enrollment.objects.filter(
            course__instructor=instructor
        ).order_by('-enrolled_date')[:10].select_related('student', 'course')
        
        recent_enrollments_data = [{
            'student_name': e.student.get_full_name(),
            'student_email': e.student.email,
            'course_title': e.course.title,
            'enrolled_date': e.enrolled_date
        } for e in recent_enrollments]
        
        # Revenue chart (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        revenue_data = InstructorEarning.objects.filter(
            instructor=instructor,
            created_at__gte=thirty_days_ago
        ).values('created_at__date').annotate(
            daily_revenue=Sum('net_amount')
        ).order_by('created_at__date')
        
        # Top performing courses
        top_courses = courses.annotate(
            revenue=Sum('earnings__net_amount')
        ).order_by('-revenue')[:5]
        
        top_courses_data = CourseListSerializer(top_courses, many=True).data
        
        return Response({
            'stats': {
                'total_courses': courses.count(),
                'total_students': total_students,
                'total_revenue': total_revenue,
                'average_rating': avg_rating,
                'published_courses': courses.filter(status='published').count(),
                'draft_courses': courses.filter(status='draft').count(),
            },
            'recent_enrollments': recent_enrollments_data,
            'revenue_chart': list(revenue_data),
            'top_courses': top_courses_data,
        })

class SectionViewSet(viewsets.ModelViewSet):
    serializer_class = SectionSerializer
    permission_classes = [IsInstructor]
    
    def get_queryset(self):
        course_uuid = self.kwargs.get('course_uuid')
        course = get_object_or_404(Course, uuid=course_uuid, instructor=self.request.user)
        return Section.objects.filter(course=course)
    
    def perform_create(self, serializer):
        course_uuid = self.kwargs.get('course_uuid')
        course = get_object_or_404(Course, uuid=course_uuid, instructor=self.request.user)
        serializer.save(course=course)

class LectureViewSet(viewsets.ModelViewSet):
    serializer_class = LectureSerializer
    permission_classes = [IsInstructor]
    
    def get_queryset(self):
        section_uuid = self.kwargs.get('section_uuid')
        section = get_object_or_404(Section, uuid=section_uuid)
        
        # Verify instructor owns the course
        if section.course.instructor != self.request.user:
            return Lecture.objects.none()
        
        return Lecture.objects.filter(section=section)
    
    def perform_create(self, serializer):
        section_uuid = self.kwargs.get('section_uuid')
        section = get_object_or_404(Section, uuid=section_uuid)
        
        if section.course.instructor != self.request.user:
            raise PermissionError("You don't have permission to add lectures to this section")
        
        serializer.save(section=section)