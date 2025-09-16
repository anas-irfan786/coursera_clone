# courses/views.py
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum, Q, F
from datetime import datetime, timedelta
from django.utils import timezone
from django.utils.text import slugify
from decimal import Decimal

from .models import Course, Section, Lecture, CourseAnnouncement
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseCreateSerializer,
    SectionSerializer, LectureSerializer
)
from enrollments.models import Enrollment
from payments.models import InstructorEarning
from reviews.models import CourseReview

class IsInstructor(IsAuthenticated):
    """Custom permission for instructors only"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.user_type == 'instructor'

@api_view(['GET'])
@permission_classes([IsInstructor])
def instructor_dashboard(request):
    """Get dashboard overview stats for instructor"""
    try:
        instructor = request.user
        
        # Get all instructor's courses
        courses = Course.objects.filter(instructor=instructor)
        
        # Calculate stats
        total_students = Enrollment.objects.filter(
            course__instructor=instructor
        ).values('student').distinct().count()
        
        total_revenue = InstructorEarning.objects.filter(
            instructor=instructor
        ).aggregate(Sum('final_amount'))['final_amount__sum'] or Decimal('0')
        
        avg_rating = courses.aggregate(
            avg=Avg('average_rating')
        )['avg'] or Decimal('0')
        
        # Recent enrollments (last 10)
        recent_enrollments = Enrollment.objects.filter(
            course__instructor=instructor
        ).select_related('student', 'course').order_by('-enrolled_date')[:10]
        
        recent_enrollments_data = [
            {
                'student_name': f"{e.student.first_name} {e.student.last_name}",
                'student_email': e.student.email,
                'course_title': e.course.title,
                'enrolled_date': e.enrolled_date.isoformat()
            }
            for e in recent_enrollments
        ]
        
        # Revenue chart data (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        revenue_by_day = {}
        
        earnings = InstructorEarning.objects.filter(
            instructor=instructor,
            created_at__gte=thirty_days_ago
        ).values('created_at__date').annotate(
            daily_revenue=Sum('final_amount')
        )
        
        # Fill in missing days with 0
        for i in range(30):
            date = (timezone.now() - timedelta(days=29-i)).date()
            revenue_by_day[date.isoformat()] = 0
        
        for earning in earnings:
            date_str = earning['created_at__date'].isoformat()
            revenue_by_day[date_str] = float(earning['daily_revenue'])
        
        revenue_chart = [
            {'date': date, 'revenue': revenue}
            for date, revenue in revenue_by_day.items()
        ]
        revenue_chart.sort(key=lambda x: x['date'])
        
        # Top performing courses
        top_courses_qs = courses.annotate(
            total_revenue=Sum('earnings__final_amount')
        ).order_by('-total_revenue')[:3]
        
        top_courses_data = []
        for course in top_courses_qs:
            revenue = InstructorEarning.objects.filter(
                course=course
            ).aggregate(Sum('final_amount'))['final_amount__sum'] or 0
            
            top_courses_data.append({
                'id': str(course.uuid),
                'title': course.title,
                'course_type': course.course_type,  # Add course_type
                'total_enrolled': course.total_enrolled,
                'average_rating': float(course.average_rating),
                'total_revenue': float(revenue),
                'thumbnail': course.thumbnail.url if course.thumbnail else None
            })
        
        return Response({
            'stats': {
                'total_courses': courses.count(),
                'total_students': total_students,
                'total_revenue': float(total_revenue),
                'average_rating': float(avg_rating),
                'published_courses': courses.filter(status='published').count(),
                'draft_courses': courses.filter(status='draft').count(),
            },
            'recent_enrollments': recent_enrollments_data,
            'revenue_chart': revenue_chart,
            'top_courses': top_courses_data
        })
        
    except Exception as e:
        # Return safe fallback data
        return Response({
            'stats': {
                'total_courses': 0,
                'total_students': 0,
                'total_revenue': 0,
                'average_rating': 0,
                'published_courses': 0,
                'draft_courses': 0,
            },
            'recent_enrollments': [],
            'revenue_chart': [],
            'top_courses': [],
            'error': str(e) if request.user.is_staff else 'Unable to load dashboard data'
        })

class InstructorCourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsInstructor]
    serializer_class = CourseListSerializer
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CourseCreateSerializer
        elif self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseListSerializer
    
    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)
    
    def get_object(self):
        # Use UUID from URL
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, uuid=self.kwargs.get('pk'))
        self.check_object_permissions(self.request, obj)
        return obj
    
    def list(self, request):
        """List all instructor's courses with revenue data"""
        try:
            courses = self.get_queryset()
            data = []
            
            for course in courses:
                try:
                    revenue = InstructorEarning.objects.filter(
                        course=course
                    ).aggregate(Sum('final_amount'))['final_amount__sum'] or 0
                except:
                    revenue = 0
                
                data.append({
                    'id': str(course.uuid),
                    'title': course.title,
                    'status': course.status,
                    'course_type': course.course_type,  # Add course_type instead of price
                    'total_enrolled': course.total_enrolled or 0,
                    'average_rating': float(course.average_rating or 0),
                    'total_revenue': float(revenue),
                    'created_at': course.created_at.isoformat(),
                    'thumbnail': course.thumbnail.url if course.thumbnail else None
                })
            
            return Response(data)
        except Exception as e:
            return Response([], status=200)  # Return empty list on error
    
    def create(self, request):
        """Create a new course"""
        serializer = CourseCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Generate slug from title if not provided
            if 'slug' not in serializer.validated_data:
                serializer.validated_data['slug'] = slugify(serializer.validated_data['title'])
            
            course = serializer.save(instructor=request.user)
            return Response({
                'id': str(course.uuid),
                'message': 'Course created successfully',
                'title': course.title
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a course"""
        course = self.get_object()
        
        # Validate course has content
        if not course.sections.exists():
            return Response(
                {'error': 'Course must have at least one section'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        course.status = 'published'
        course.published_date = timezone.now()
        course.save()
        
        return Response({'status': 'published', 'message': 'Course published successfully'})
    
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Unpublish a course"""
        course = self.get_object()
        course.status = 'draft'
        course.save()
        return Response({'status': 'draft', 'message': 'Course unpublished successfully'})
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get list of enrolled students"""
        course = self.get_object()
        enrollments = Enrollment.objects.filter(
            course=course
        ).select_related('student')
        
        data = [
            {
                'id': str(enrollment.student.uuid),
                'name': f"{enrollment.student.first_name} {enrollment.student.last_name}",
                'email': enrollment.student.email,
                'enrolled_date': enrollment.enrolled_date.isoformat(),
                'progress': float(enrollment.progress_percentage),
                'last_accessed': enrollment.last_accessed.isoformat() if enrollment.last_accessed else None,
                'status': enrollment.status
            }
            for enrollment in enrollments
        ]
        
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get course-specific analytics"""
        course = self.get_object()
        
        total_students = Enrollment.objects.filter(course=course).count()
        active_students = Enrollment.objects.filter(
            course=course,
            last_accessed__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        completion_rate = 0
        if total_students > 0:
            completed = Enrollment.objects.filter(
                course=course,
                status='completed'
            ).count()
            completion_rate = (completed / total_students) * 100
        
        avg_progress = Enrollment.objects.filter(
            course=course
        ).aggregate(Avg('progress_percentage'))['progress_percentage__avg'] or 0
        
        total_revenue = InstructorEarning.objects.filter(
            course=course
        ).aggregate(Sum('final_amount'))['final_amount__sum'] or 0
        
        # Recent reviews
        recent_reviews = CourseReview.objects.filter(
            course=course
        ).order_by('-created_at')[:5]
        
        reviews_data = [
            {
                'student_name': f"{r.student.first_name} {r.student.last_name}",
                'rating': r.rating,
                'title': r.title,
                'comment': r.comment,
                'created_at': r.created_at.isoformat()
            }
            for r in recent_reviews
        ]
        
        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'completion_rate': float(completion_rate),
            'average_progress': float(avg_progress),
            'total_revenue': float(total_revenue),
            'average_rating': float(course.average_rating),
            'total_reviews': course.total_reviews,
            'recent_reviews': reviews_data
        })
    
    @action(detail=True, methods=['post'], url_path='delete-course')
    def delete_course(self, request, pk=None):
        """Delete a course with confirmation"""
        try:
            course = self.get_object()
            
            # Debug logging
            print(f"Delete course request received for course: {course.title}")
            print(f"Request data: {request.data}")
            
            # Get confirmation string from request
            confirmation = request.data.get('confirmation', '')
            expected_confirmation = f"{request.user.email}/{course.title}"
            
            print(f"Expected confirmation: {expected_confirmation}")
            print(f"Received confirmation: {confirmation}")
            
            if confirmation != expected_confirmation:
                return Response({
                    'error': f'Confirmation failed. Please type "{expected_confirmation}" to confirm deletion.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error in delete_course: {str(e)}")
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Check if course has enrollments
        enrollment_count = Enrollment.objects.filter(course=course).count()
        if enrollment_count > 0:
            return Response({
                'error': f'Cannot delete course with {enrollment_count} enrolled students. Please contact support for assistance.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store course title for response
        course_title = course.title
        
        # Delete the course (this will cascade delete related objects)
        course.delete()
        
        print(f"Course {course_title} successfully deleted")
        
        return Response({
            'message': f'Course "{course_title}" has been permanently deleted.'
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def test_endpoint(self, request, pk=None):
        """Test endpoint to verify API is accessible"""
        course = self.get_object()
        return Response({
            'message': f'Test endpoint working for course: {course.title}',
            'course_id': str(course.uuid),
            'user': request.user.email
        })

# Section and Lecture ViewSets
class SectionViewSet(viewsets.ModelViewSet):
    serializer_class = SectionSerializer
    permission_classes = [IsInstructor]
    
    def get_queryset(self):
        course_uuid = self.kwargs.get('course_uuid')
        return Section.objects.filter(
            course__uuid=course_uuid,
            course__instructor=self.request.user
        )
    
    def perform_create(self, serializer):
        course_uuid = self.kwargs.get('course_uuid')
        course = get_object_or_404(Course, uuid=course_uuid, instructor=self.request.user)
        serializer.save(course=course)

class LectureViewSet(viewsets.ModelViewSet):
    serializer_class = LectureSerializer
    permission_classes = [IsInstructor]
    
    def get_queryset(self):
        section_uuid = self.kwargs.get('section_uuid')
        return Lecture.objects.filter(
            section__uuid=section_uuid,
            section__course__instructor=self.request.user
        )
    
    def perform_create(self, serializer):
        section_uuid = self.kwargs.get('section_uuid')
        section = get_object_or_404(
            Section,
            uuid=section_uuid,
            course__instructor=self.request.user
        )
        serializer.save(section=section)