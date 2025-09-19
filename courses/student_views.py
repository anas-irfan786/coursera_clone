# courses/student_views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Sum, Q, F, Exists, OuterRef
from django.utils import timezone
from datetime import datetime, timedelta, date
from decimal import Decimal

from .models import Course, Section, Lecture
from enrollments.models import Enrollment, LectureProgress, LearningStreak, CourseBookmark
from certificates.models import Certificate
from reviews.models import CourseReview
from accounts.models import User, StudentProfile
from assessments.models import QuizAttempt

class IsStudent(IsAuthenticated):
    """Permission class for students only"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.user_type == 'student'

@api_view(['GET'])
@permission_classes([AllowAny])
def all_courses(request):
    """Get all available courses for students to explore"""
    
    # Get filter parameters
    category = request.GET.get('category', 'all')
    level = request.GET.get('level', 'all')
    course_type = request.GET.get('type', 'all')
    search = request.GET.get('search', '')
    sort_by = request.GET.get('sort', 'popular')
    
    # Base queryset - only published courses
    courses = Course.objects.filter(status='published')
    
    # Apply filters
    if category != 'all':
        courses = courses.filter(category__slug=category)
    
    if level != 'all':
        courses = courses.filter(level=level)
    
    if course_type != 'all':
        courses = courses.filter(course_type=course_type)
    
    if search:
        courses = courses.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(instructor__first_name__icontains=search) |
            Q(instructor__last_name__icontains=search)
        )
    
    # Apply sorting
    if sort_by == 'popular':
        courses = courses.order_by('-total_enrolled')
    elif sort_by == 'rating':
        courses = courses.order_by('-average_rating')
    elif sort_by == 'newest':
        courses = courses.order_by('-created_at')
    
    # Annotate with additional data
    if request.user.is_authenticated:
        courses = courses.annotate(
            is_enrolled=Exists(
                Enrollment.objects.filter(
                    course=OuterRef('pk'),
                    student=request.user
                )
            ),
            is_bookmarked=Exists(
                CourseBookmark.objects.filter(
                    course=OuterRef('pk'),
                    student=request.user
                )
            )
        )
    
    # Serialize data
    course_data = []
    for course in courses[:20]:  # Limit to 20 for performance
        modules_count = course.sections.count()
        total_duration = 0
        for section in course.sections.all():
            for lecture in section.lectures.all():
                if lecture.content_type == 'video':
                    try:
                        from content.models import VideoContent
                        video_content = VideoContent.objects.get(lecture=lecture)
                        total_duration += video_content.duration
                    except VideoContent.DoesNotExist:
                        pass
        total_duration = total_duration / 3600  # Convert to hours
        
        course_data.append({
            'id': str(course.uuid),
            'title': course.title,
            'instructor': f"{course.instructor.first_name} {course.instructor.last_name}",
            'instructor_id': str(course.instructor.uuid),
            'thumbnail': course.thumbnail.url if course.thumbnail else None,
            'rating': float(course.average_rating),
            'students': course.total_enrolled,
            'duration': f"{int(total_duration)} hours",
            'level': course.level,
            'category': course.category.name if course.category else 'General',
            'course_type': course.course_type,
            'modules': modules_count,
            'description': course.description[:200] + '...' if len(course.description) > 200 else course.description,
            'is_enrolled': getattr(course, 'is_enrolled', False),
            'is_bookmarked': getattr(course, 'is_bookmarked', False)
        })
    
    return Response(course_data)

@api_view(['GET'])
@permission_classes([IsStudent])
def student_enrolled_courses(request):
    """Get student's enrolled courses with progress"""
    
    enrollments = Enrollment.objects.filter(
        student=request.user,
        status='active'
    ).select_related('course', 'course__instructor').order_by('-last_accessed')
    
    enrolled_data = []
    for enrollment in enrollments:
        course = enrollment.course
        
        # Calculate total lessons and completed
        total_lessons = Lecture.objects.filter(
            section__course=course
        ).count()
        
        completed_lessons = LectureProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()
        
        # Get next lesson
        incomplete_lectures = Lecture.objects.filter(
            section__course=course
        ).exclude(
            id__in=LectureProgress.objects.filter(
                enrollment=enrollment,
                is_completed=True
            ).values_list('lecture_id', flat=True)
        ).order_by('section__order', 'order').first()
        
        # Estimate completion time
        remaining_lessons = total_lessons - completed_lessons
        avg_lesson_time = 30  # minutes
        estimated_hours = (remaining_lessons * avg_lesson_time) / 60
        
        if estimated_hours < 24:
            estimated_completion = f"{int(estimated_hours)} hours"
        elif estimated_hours < 168:
            estimated_completion = f"{int(estimated_hours/24)} days"
        else:
            estimated_completion = f"{int(estimated_hours/168)} weeks"
        
        enrolled_data.append({
            'id': str(enrollment.uuid),
            'course_id': str(course.uuid),
            'title': course.title,
            'instructor': f"{course.instructor.first_name} {course.instructor.last_name}",
            'thumbnail': course.thumbnail.url if course.thumbnail else None,
            'progress': float(enrollment.progress_percentage),
            'last_accessed': enrollment.last_accessed.isoformat() if enrollment.last_accessed else None,
            'next_lesson': incomplete_lectures.title if incomplete_lectures else "All lessons completed",
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'estimated_completion': estimated_completion
        })
    
    return Response(enrolled_data)

@api_view(['GET'])
@permission_classes([IsStudent])
def student_stats(request):
    """Get student statistics and achievements"""
    
    student = request.user
    
    # Get or create student profile
    profile, created = StudentProfile.objects.get_or_create(user=student)
    
    # Calculate stats
    total_courses = Enrollment.objects.filter(student=student).count()
    completed_courses = Enrollment.objects.filter(
        student=student,
        status='completed'
    ).count()
    
    certificates_earned = Certificate.objects.filter(student=student).count()
    
    # Calculate total learning hours
    total_seconds = LectureProgress.objects.filter(
        enrollment__student=student
    ).aggregate(Sum('progress_seconds'))['progress_seconds__sum'] or 0
    total_learning_hours = total_seconds / 3600
    
    # Calculate learning streak
    today = timezone.now().date()
    current_streak = calculate_learning_streak(student)
    longest_streak = profile.learning_streak  # Stored in profile
    
    # This week's hours
    week_start = today - timedelta(days=today.weekday())
    week_seconds = LectureProgress.objects.filter(
        enrollment__student=student,
        updated_at__gte=week_start
    ).aggregate(Sum('progress_seconds'))['progress_seconds__sum'] or 0
    this_week_hours = week_seconds / 3600
    
    # Achievements (simplified version)
    achievements = calculate_achievements(student)
    
    return Response({
        'total_courses': total_courses,
        'completed_courses': completed_courses,
        'certificates_earned': certificates_earned,
        'total_learning_hours': round(total_learning_hours, 1),
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'this_week_hours': round(this_week_hours, 1),
        'achievements': achievements
    })

@api_view(['POST'])
@permission_classes([IsStudent])
def enroll_course(request, course_uuid):
    """Enroll student in a course"""
    
    course = get_object_or_404(Course, uuid=course_uuid)
    student = request.user
    
    # Check if already enrolled
    if Enrollment.objects.filter(course=course, student=student).exists():
        return Response(
            {'error': 'Already enrolled in this course'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if course is free or student has subscription
    if course.course_type == 'coursera_plus':
        # Check if student has active subscription
        from payments.models import Subscription
        
        has_subscription = Subscription.objects.filter(
            user=student,
            status='active',
            end_date__gte=timezone.now()
        ).exists()
        
        if not has_subscription:
            return Response(
                {'error': 'Coursera Plus subscription required'},
                status=status.HTTP_402_PAYMENT_REQUIRED
            )
    
    # Create enrollment
    enrollment = Enrollment.objects.create(
        student=student,
        course=course,
        enrolled_date=timezone.now()
    )
    
    # Update course enrolled count
    course.total_enrolled += 1
    course.save()
    
    return Response({
        'message': 'Successfully enrolled in course',
        'enrollment_id': str(enrollment.uuid)
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsStudent])
def bookmark_course(request, course_uuid):
    """Add/remove course bookmark"""
    
    course = get_object_or_404(Course, uuid=course_uuid)
    student = request.user
    
    bookmark, created = CourseBookmark.objects.get_or_create(
        student=student,
        course=course
    )
    
    if not created:
        bookmark.delete()
        return Response({'message': 'Bookmark removed'})
    
    return Response({'message': 'Course bookmarked'})

@api_view(['GET'])
@permission_classes([IsStudent])
def student_certificates(request):
    """Get student's earned certificates"""
    
    certificates = Certificate.objects.filter(
        student=request.user
    ).select_related('course', 'enrollment')
    
    cert_data = []
    for cert in certificates:
        cert_data.append({
            'id': str(cert.uuid),
            'course_title': cert.course.title,
            'instructor': f"{cert.course.instructor.first_name} {cert.course.instructor.last_name}",
            'issue_date': cert.issue_date.isoformat(),
            'certificate_id': cert.certificate_number,
            'verification_url': f"https://coursera.com/verify/{cert.verification_code}",
            'grade': float(cert.final_grade) if cert.final_grade else None,
            'thumbnail': cert.course.thumbnail.url if cert.course.thumbnail else None
        })
    
    return Response(cert_data)

@api_view(['GET'])
@permission_classes([IsStudent])
def student_achievements(request):
    """Get student achievements and gamification data"""
    
    student = request.user
    profile, _ = StudentProfile.objects.get_or_create(user=student)
    
    # Calculate points and level
    total_points = calculate_total_points(student)
    current_level = total_points // 250  # 250 points per level
    next_level_points = (current_level + 1) * 250
    
    # Calculate ranks (simplified)
    global_rank = User.objects.filter(
        user_type='student',
        student_profile__total_learning_hours__gt=profile.total_learning_hours
    ).count() + 1
    
    # Monthly rank
    month_start = timezone.now().replace(day=1)
    monthly_rank = 50  # Simplified
    
    # Get all achievements
    achievements = get_all_achievements(student)
    
    return Response({
        'total_points': total_points,
        'current_level': current_level,
        'next_level_points': next_level_points,
        'global_rank': global_rank,
        'monthly_rank': monthly_rank,
        'achievements': achievements
    })

# Helper Functions
def calculate_learning_streak(student):
    """Calculate current learning streak"""
    today = timezone.now().date()
    streak = 0
    
    for i in range(30):  # Check last 30 days
        check_date = today - timedelta(days=i)
        has_activity = LectureProgress.objects.filter(
            enrollment__student=student,
            updated_at__date=check_date
        ).exists()
        
        if has_activity:
            streak += 1
        elif i > 0:  # Don't break on today if no activity yet
            break
    
    return streak

def calculate_achievements(student):
    """Calculate basic achievements"""
    achievements = []
    
    # Fast Learner - Complete 5 lessons in one day
    today_lessons = LectureProgress.objects.filter(
        enrollment__student=student,
        completed_date__date=timezone.now().date()
    ).count()
    
    if today_lessons >= 5:
        achievements.append({
            'id': 1,
            'title': 'Fast Learner',
            'icon': '🚀',
            'description': 'Complete 5 lessons in one day'
        })
    
    # Consistent - 7 day streak
    streak = calculate_learning_streak(student)
    if streak >= 7:
        achievements.append({
            'id': 2,
            'title': 'Consistent',
            'icon': '🔥',
            'description': '7 day learning streak'
        })
    
    # Quiz Master - High quiz scores
    high_scores = QuizAttempt.objects.filter(
        student=student,
        score__gte=100
    ).count()
    
    if high_scores >= 3:
        achievements.append({
            'id': 3,
            'title': 'Quiz Master',
            'icon': '🏆',
            'description': 'Score 100% on 3 quizzes'
        })
    
    return achievements

def calculate_total_points(student):
    """Calculate total points for gamification"""
    points = 0
    
    # Points for completed courses (100 each)
    completed = Enrollment.objects.filter(
        student=student,
        status='completed'
    ).count()
    points += completed * 100
    
    # Points for lessons (5 each)
    lessons = LectureProgress.objects.filter(
        enrollment__student=student,
        is_completed=True
    ).count()
    points += lessons * 5
    
    # Points for quizzes (10-50 based on score)
    quizzes = QuizAttempt.objects.filter(
        student=student,
        passed=True
    ).count()
    points += quizzes * 25
    
    return points

def get_all_achievements(student):
    """Get comprehensive list of achievements"""
    
    achievements = [
        {
            'id': 1,
            'title': 'First Steps',
            'description': 'Complete your first lesson',
            'icon': '👶',
            'earned': LectureProgress.objects.filter(
                enrollment__student=student,
                is_completed=True
            ).exists(),
            'date': None,
            'progress': 100 if LectureProgress.objects.filter(
                enrollment__student=student,
                is_completed=True
            ).exists() else 0
        },
        {
            'id': 2,
            'title': 'Dedicated Learner',
            'description': 'Complete 10 lessons',
            'icon': '📚',
            'earned': False,
            'progress': min(100, LectureProgress.objects.filter(
                enrollment__student=student,
                is_completed=True
            ).count() * 10)
        },
        {
            'id': 3,
            'title': 'Week Warrior',
            'description': '7 day learning streak',
            'icon': '🔥',
            'earned': calculate_learning_streak(student) >= 7,
            'progress': min(100, calculate_learning_streak(student) * 100 / 7)
        },
        {
            'id': 4,
            'title': 'Quiz Master',
            'description': 'Score 100% on 5 quizzes',
            'icon': '🏆',
            'earned': False,
            'progress': min(100, QuizAttempt.objects.filter(
                student=student,
                score__gte=100
            ).count() * 20)
        },
        {
            'id': 5,
            'title': 'Speed Learner',
            'description': 'Complete a course in 7 days',
            'icon': '⚡',
            'earned': False,
            'progress': 0
        },
        {
            'id': 6,
            'title': 'Polyglot',
            'description': 'Complete courses in 3 different categories',
            'icon': '🌍',
            'earned': False,
            'progress': 0
        }
    ]
    
    # Set earned dates
    for achievement in achievements:
        if achievement['earned']:
            achievement['date'] = timezone.now().date().isoformat()
    
    return achievements

@api_view(['GET'])
@permission_classes([IsStudent])
def weekly_progress(request):
    """Get weekly learning progress for charts"""
    
    student = request.user
    today = timezone.now().date()
    week_data = []
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_name = day.strftime('%a')
        
        # Calculate hours for this day
        seconds = LectureProgress.objects.filter(
            enrollment__student=student,
            updated_at__date=day
        ).aggregate(Sum('progress_seconds'))['progress_seconds__sum'] or 0
        
        hours = round(seconds / 3600, 1)
        week_data.append({
            'day': day_name,
            'hours': hours
        })
    
    return Response(week_data)