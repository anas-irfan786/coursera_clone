# courses/views.py
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum, Q, F, Max
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
from assessments.models import Quiz, Question, QuestionOption, Assignment

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
    lookup_field = 'uuid'

    def get_queryset(self):
        course_uuid = self.kwargs.get('course_uuid')
        if course_uuid:
            return Section.objects.filter(
                course__uuid=course_uuid,
                course__instructor=self.request.user
            )
        else:
            return Section.objects.filter(
                course__instructor=self.request.user
            )
    
    def perform_create(self, serializer):
        course_uuid = self.kwargs.get('course_uuid')
        course = get_object_or_404(Course, uuid=course_uuid, instructor=self.request.user)

        # Auto-assign the next available order (count-based to avoid gaps)
        current_count = Section.objects.filter(course=course).count()
        next_order = current_count + 1

        serializer.save(course=course, order=next_order)

    def perform_destroy(self, instance):
        """Delete section and reorder all remaining sections in the course sequentially"""
        course = instance.course

        # Delete the instance
        super().perform_destroy(instance)

        # Reorder ALL remaining sections in the course to ensure sequential numbering (1, 2, 3, ...)
        remaining_sections = Section.objects.filter(course=course).order_by('order')

        # Update order to be sequential starting from 1
        for i, section in enumerate(remaining_sections, 1):
            if section.order != i:
                section.order = i
                section.save()

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder_sections(self, request, course_uuid=None):
        """Reorder sections within a course"""
        try:
            # Get course_uuid from kwargs or parameter
            course_uuid = course_uuid or self.kwargs.get('course_uuid')
            course = get_object_or_404(Course, uuid=course_uuid, instructor=request.user)

            section_orders = request.data.get('section_orders', [])

            # Use transaction to avoid unique constraint violations
            from django.db import transaction

            with transaction.atomic():
                # First, collect all sections to update
                sections_to_update = []
                for item in section_orders:
                    section_uuid = item.get('uuid')
                    new_order = item.get('order')

                    try:
                        section = Section.objects.get(
                            uuid=section_uuid,
                            course=course
                        )
                        sections_to_update.append((section, new_order))
                    except Section.DoesNotExist:
                        continue

                # Step 1: Set all sections to temporary high order values (1000+)
                for i, (section, new_order) in enumerate(sections_to_update):
                    section.order = 1000 + i  # Temporary high value
                    section.save()

                # Step 2: Now set the final order values
                for section, new_order in sections_to_update:
                    section.order = new_order
                    section.save()

            return Response({'message': 'Sections reordered successfully'})

        except Exception as e:
            return Response(
                {'error': f'Failed to reorder sections: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

class LectureViewSet(viewsets.ModelViewSet):
    serializer_class = LectureSerializer
    permission_classes = [IsInstructor]
    lookup_field = 'uuid'
    
    def get_queryset(self):
        section_uuid = self.kwargs.get('section_uuid')
        if section_uuid:
            return Lecture.objects.filter(
                section__uuid=section_uuid,
                section__course__instructor=self.request.user
            )
        else:
            return Lecture.objects.filter(
                section__course__instructor=self.request.user
            )
    
    def perform_create(self, serializer):
        section_uuid = self.kwargs.get('section_uuid')
        section = get_object_or_404(
            Section,
            uuid=section_uuid,
            course__instructor=self.request.user
        )

        # Auto-assign the next available order (count-based to avoid gaps)
        current_count = Lecture.objects.filter(section=section).count()
        next_order = current_count + 1

        lecture = serializer.save(section=section, order=next_order)

        # If this is a video lecture, create the video content
        if lecture.content_type == 'video':
            self._create_video_content(lecture)

        # If this is a quiz lecture, create the quiz and questions
        if lecture.content_type == 'quiz':
            self._create_quiz_data(lecture)

        # If this is an assignment lecture, create the assignment
        if lecture.content_type == 'assignment':
            self._create_assignment_data(lecture)

        # If this is a reading lecture, create the reading document
        if lecture.content_type == 'reading':
            self._create_reading_data(lecture)

    def perform_update(self, serializer):
        lecture = serializer.save()

        # Handle video content updates
        if lecture.content_type == 'video':
            self._update_video_content(lecture)

        # Handle quiz updates
        if lecture.content_type == 'quiz':
            self._update_quiz_data(lecture)

        # Handle assignment updates
        if lecture.content_type == 'assignment':
            self._update_assignment_data(lecture)

        # Handle reading updates
        if lecture.content_type == 'reading':
            self._update_reading_data(lecture)

    def perform_destroy(self, instance):
        """Delete lecture and reorder all remaining lectures in the section sequentially"""
        section = instance.section

        # Delete the instance
        super().perform_destroy(instance)

        # Reorder ALL remaining lectures in the section to ensure sequential numbering (1, 2, 3, ...)
        remaining_lectures = Lecture.objects.filter(section=section).order_by('order')

        # Update order to be sequential starting from 1
        for i, lecture in enumerate(remaining_lectures, 1):
            if lecture.order != i:
                lecture.order = i
                lecture.save()

    def _update_video_content(self, lecture):
        """Update or create video content for video lectures"""
        from content.models import VideoContent, Subtitle

        video_file = self.request.FILES.get('video_file')

        if video_file:
            # Get or create VideoContent
            video_content, created = VideoContent.objects.get_or_create(
                lecture=lecture,
                defaults={
                    'video_file': video_file,
                    'video_url': '',
                }
            )

            # If not created, update the video file
            if not created:
                video_content.video_file = video_file
                video_content.save()

            # Handle subtitle file if provided
            subtitle_file = self.request.FILES.get('subtitle_file')
            if subtitle_file:
                # Update or create subtitle
                subtitle, created = Subtitle.objects.get_or_create(
                    video=video_content,
                    language='en',
                    defaults={
                        'file': subtitle_file,
                        'is_auto_generated': False
                    }
                )
                if not created:
                    subtitle.file = subtitle_file
                    subtitle.save()

    def _update_quiz_data(self, lecture):
        """Update quiz data - for now, we'll recreate it"""
        from assessments.models import Quiz

        # Delete existing quiz if it exists
        try:
            existing_quiz = Quiz.objects.get(lecture=lecture)
            existing_quiz.delete()
        except Quiz.DoesNotExist:
            pass

        # Create new quiz with updated data
        self._create_quiz_data(lecture)

    def _update_assignment_data(self, lecture):
        """Update assignment data - preserve existing attachment if no new one provided"""
        from assessments.models import Assignment

        # Get existing assignment if it exists
        existing_assignment = None
        try:
            existing_assignment = Assignment.objects.get(lecture=lecture)
        except Assignment.DoesNotExist:
            pass

        # If we have an existing assignment, preserve its file if no new file is uploaded
        if existing_assignment:
            existing_attachment = existing_assignment.attachment
            existing_assignment.delete()

            # Create new assignment with updated data
            self._create_assignment_data(lecture)

            # If no new attachment was provided, restore the old one
            request_data = self.request.data
            attachment_file = request_data.get('attachment') or self.request.FILES.get('attachment')
            if not attachment_file and existing_attachment:
                updated_assignment = Assignment.objects.get(lecture=lecture)
                updated_assignment.attachment = existing_attachment
                updated_assignment.save()
        else:
            # Create new assignment with updated data
            self._create_assignment_data(lecture)

    def _create_quiz_data(self, lecture):
        """Create quiz, questions and options from lecture data"""
        request_data = self.request.data

        # Create Quiz
        quiz_settings = request_data.get('quiz_settings', {})
        # Handle JSON string from FormData
        if isinstance(quiz_settings, str):
            import json
            quiz_settings = json.loads(quiz_settings)
        quiz = Quiz.objects.create(
            course=lecture.section.course,
            section=lecture.section,
            lecture=lecture,
            title=lecture.title,
            description=lecture.description or '',
            passing_score=quiz_settings.get('passing_score', 60),
            time_limit=quiz_settings.get('time_limit'),
            max_attempts=quiz_settings.get('max_attempts', 3),
            weight=quiz_settings.get('weight', 0),
            randomize_questions=quiz_settings.get('randomize_questions', False),
            show_answers=quiz_settings.get('show_answers', True)
        )

        # Create Questions and Options
        questions_data = request_data.get('questions', [])
        # Handle JSON string from FormData
        if isinstance(questions_data, str):
            import json
            questions_data = json.loads(questions_data)
        for order, question_data in enumerate(questions_data):
            question = Question.objects.create(
                quiz=quiz,
                question_text=question_data.get('question_text', ''),
                question_type=question_data.get('question_type', 'multiple_choice'),
                order=order,
                points=question_data.get('points', 1),
                explanation=question_data.get('explanation', '')
            )

            # Create Options
            options_data = question_data.get('options', [])
            for option_order, option_data in enumerate(options_data):
                QuestionOption.objects.create(
                    question=question,
                    option_text=option_data.get('option_text', ''),
                    is_correct=option_data.get('is_correct', False),
                    order=option_data.get('order', option_order)
                )

    def _create_assignment_data(self, lecture):
        """Create assignment from lecture data"""
        request_data = self.request.data
        assignment_settings = request_data.get('assignment_settings', {})
        # Handle JSON string from FormData
        if isinstance(assignment_settings, str):
            import json
            assignment_settings = json.loads(assignment_settings)

        # Parse due date if provided
        due_date = None
        if assignment_settings.get('due_date'):
            try:
                from datetime import datetime
                from django.utils import timezone
                # Parse the datetime from frontend (which sends local time)
                naive_datetime = datetime.fromisoformat(assignment_settings['due_date'].replace('T', ' '))
                # Convert from local timezone to UTC for storage
                due_date = timezone.make_aware(naive_datetime, timezone=timezone.get_current_timezone())
            except (ValueError, AttributeError):
                pass

        # Handle attachment file
        attachment_file = request_data.get('attachment') or self.request.FILES.get('attachment')

        # Create Assignment record
        Assignment.objects.create(
            course=lecture.section.course,
            section=lecture.section,
            lecture=lecture,
            title=lecture.title,
            description=lecture.description or '',
            instructions=assignment_settings.get('instructions', ''),
            max_points=assignment_settings.get('max_points', 100),
            passing_score=assignment_settings.get('passing_score', 60),
            weight=assignment_settings.get('weight', 0),
            due_date=due_date,
            attachment=attachment_file,
            allow_late_submission=assignment_settings.get('allow_late_submission', True),
        )

    def _create_video_content(self, lecture):
        """Create video content and subtitles for video lectures"""
        from content.models import VideoContent, Subtitle

        # Get video data
        video_file = self.request.FILES.get('video_file')
        video_url = self.request.data.get('video_url', '')

        # Only create VideoContent if we have video_file or video_url
        if video_file or video_url:
            # Create VideoContent record
            video_content = VideoContent.objects.create(
                lecture=lecture,
                video_file=video_file,
                video_url=video_url,
            )

            # Handle subtitle file if provided
            subtitle_file = self.request.FILES.get('subtitle_file')
            if subtitle_file:
                # Default to English for now, could be made configurable
                Subtitle.objects.create(
                    video=video_content,
                    language='en',
                    file=subtitle_file,
                    is_auto_generated=False
                )

    def _update_video_content(self, lecture):
        """Update video content for video lectures"""
        from content.models import VideoContent, Subtitle

        # Get existing video content if it exists
        try:
            video_content = VideoContent.objects.get(lecture=lecture)
        except VideoContent.DoesNotExist:
            video_content = None

        # Get video data
        video_file = self.request.FILES.get('video_file')
        video_url = self.request.data.get('video_url', '')

        # Only update/create if we have video data
        if video_file or video_url:
            if video_content:
                # Update existing video content
                if video_file:
                    video_content.video_file = video_file
                video_content.video_url = video_url
                video_content.save()
            else:
                # Create new video content
                video_content = VideoContent.objects.create(
                    lecture=lecture,
                    video_file=video_file,
                    video_url=video_url,
                )

            # Handle subtitle file if provided
            subtitle_file = self.request.FILES.get('subtitle_file')
            if subtitle_file:
                # Remove existing subtitle and create new one
                Subtitle.objects.filter(video=video_content, language='en').delete()
                Subtitle.objects.create(
                    video=video_content,
                    language='en',
                    file=subtitle_file,
                    is_auto_generated=False
                )

    def _create_reading_data(self, lecture):
        """Create reading from lecture data"""
        from content.models import Reading
        import os

        # Get content and file data
        content = self.request.data.get('article_content', '')
        reading_file = self.request.FILES.get('reading_file')
        markdown_file = self.request.FILES.get('markdown_file')
        pdf_file = self.request.FILES.get('pdf_file')

        # Determine which file to use
        file_to_upload = reading_file or markdown_file or pdf_file

        # Validate file if provided
        if file_to_upload:
            file_ext = os.path.splitext(file_to_upload.name)[1].lower()
            allowed_extensions = ['.pdf', '.md', '.markdown']

            if file_ext not in allowed_extensions:
                from rest_framework.exceptions import ValidationError
                raise ValidationError(f'Invalid file type. Only PDF and Markdown files are allowed.')

        # Create Reading record (either with content or file or both)
        if content or file_to_upload:
            Reading.objects.create(
                lecture=lecture,
                content=content,
                file=file_to_upload,
                is_downloadable=True
            )

    def _update_reading_data(self, lecture):
        """Update reading for reading lectures"""
        from content.models import Reading
        import os

        # Get existing reading if it exists
        existing_reading = None
        try:
            existing_reading = Reading.objects.get(lecture=lecture)
        except Reading.DoesNotExist:
            pass

        # Get content and file data
        content = self.request.data.get('article_content', '')
        reading_file = self.request.FILES.get('reading_file')
        markdown_file = self.request.FILES.get('markdown_file')
        pdf_file = self.request.FILES.get('pdf_file')

        # Determine which file to use
        file_to_upload = reading_file or markdown_file or pdf_file

        # Validate file if provided
        if file_to_upload:
            file_ext = os.path.splitext(file_to_upload.name)[1].lower()
            allowed_extensions = ['.pdf', '.md', '.markdown']

            if file_ext not in allowed_extensions:
                from rest_framework.exceptions import ValidationError
                raise ValidationError(f'Invalid file type. Only PDF and Markdown files are allowed.')

        if existing_reading:
            # Update existing reading
            existing_reading.content = content
            if file_to_upload:
                existing_reading.file = file_to_upload
            existing_reading.save()
        else:
            # Create new reading if content or file provided
            if content or file_to_upload:
                Reading.objects.create(
                    lecture=lecture,
                    content=content,
                    file=file_to_upload,
                    is_downloadable=True
                )

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder_lectures(self, request, section_uuid=None):
        """Reorder lectures within a section"""
        try:
            # Get section_uuid from kwargs or parameter
            section_uuid = section_uuid or self.kwargs.get('section_uuid')
            section = get_object_or_404(
                Section,
                uuid=section_uuid,
                course__instructor=request.user
            )

            lecture_orders = request.data.get('lecture_orders', [])

            # Use transaction to avoid unique constraint violations
            from django.db import transaction

            with transaction.atomic():
                # First, collect all lectures to update
                lectures_to_update = []
                for item in lecture_orders:
                    lecture_uuid = item.get('uuid')
                    new_order = item.get('order')

                    try:
                        lecture = Lecture.objects.get(
                            uuid=lecture_uuid,
                            section=section
                        )
                        lectures_to_update.append((lecture, new_order))
                    except Lecture.DoesNotExist:
                        continue

                # Step 1: Set all lectures to temporary high order values (1000+)
                for i, (lecture, new_order) in enumerate(lectures_to_update):
                    lecture.order = 1000 + i  # Temporary high value
                    lecture.save()

                # Step 2: Now set the final order values
                for lecture, new_order in lectures_to_update:
                    lecture.order = new_order
                    lecture.save()

            return Response({'message': 'Lectures reordered successfully'})

        except Exception as e:
            return Response(
                {'error': f'Failed to reorder lectures: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )