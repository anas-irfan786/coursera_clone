# enrollments/enrollment_services.py
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Enrollment
from courses.models import Course

class EnrollmentService:
    """Service to handle student enrollment with access control"""

    @staticmethod
    def can_student_enroll(student, course):
        """
        Check if a student can enroll in a course based on:
        1. Course type (free vs coursera_plus)
        2. Student subscription status
        3. Course availability
        """
        # Check if course is published
        if course.status != 'published':
            return False, "Course is not available for enrollment"

        # Check if student is already enrolled
        if Enrollment.objects.filter(student=student, course=course).exists():
            return False, "Already enrolled in this course"

        # Free courses - everyone can enroll
        if course.course_type == 'free':
            return True, "Can enroll in free course"

        # Coursera Plus courses - need active subscription
        if course.course_type == 'coursera_plus':
            # Check if student has active Plus subscription
            if hasattr(student, 'plus_subscription'):
                if student.plus_subscription.can_access_plus_courses():
                    return True, "Can enroll with Plus subscription"
                else:
                    return False, "Plus subscription required but not active"
            else:
                return False, "Plus subscription required"

        return False, "Unknown course type"

    @staticmethod
    def enroll_student(student, course):
        """
        Enroll a student in a course with proper validation
        """
        can_enroll, message = EnrollmentService.can_student_enroll(student, course)

        if not can_enroll:
            raise ValidationError(message)

        # Create enrollment
        enrollment = Enrollment.objects.create(
            student=student,
            course=course,
            enrolled_date=timezone.now(),
            status='active'
        )

        return enrollment

    @staticmethod
    def get_student_accessible_courses(student):
        """
        Get all courses a student can access based on their subscription
        """
        # Base query for published courses
        courses = Course.objects.filter(status='published')

        # Check subscription status
        has_plus = False
        if hasattr(student, 'plus_subscription'):
            has_plus = student.plus_subscription.can_access_plus_courses()

        if has_plus:
            # Plus subscribers can see all courses
            return courses
        else:
            # Free users can only see free courses
            return courses.filter(course_type='free')