# enrollments/progress_models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import BaseModel
from courses.models import Course, Section, Lecture
from .models import Enrollment

class EnhancedLectureProgress(BaseModel):
    """Enhanced lecture progress tracking with completion requirements"""

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE,
                                  related_name='enhanced_lecture_progress')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE)

    # Completion tracking
    is_completed = models.BooleanField(default=False)
    completion_date = models.DateTimeField(null=True, blank=True)
    completion_method = models.CharField(max_length=50, blank=True)  # 'manual', 'auto', 'quiz_passed', etc.

    # Video-specific tracking
    total_watch_time = models.IntegerField(default=0)  # seconds
    last_watched_position = models.IntegerField(default=0)  # seconds
    watch_sessions = models.IntegerField(default=0)
    first_watched_at = models.DateTimeField(null=True, blank=True)
    last_watched_at = models.DateTimeField(null=True, blank=True)

    # Reading-specific tracking
    reading_time_spent = models.IntegerField(default=0)  # seconds
    reading_completed_at = models.DateTimeField(null=True, blank=True)

    # Quiz/Assignment completion (for those lecture types)
    quiz_attempts = models.IntegerField(default=0)
    quiz_best_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    assignment_submitted = models.BooleanField(default=False)
    assignment_grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'enhanced_lecture_progress'
        unique_together = ['enrollment', 'lecture']
        indexes = [
            models.Index(fields=['enrollment', 'is_completed']),
            models.Index(fields=['lecture', 'is_completed']),
        ]

    def mark_completed(self, method='manual'):
        """Mark lecture as completed"""
        if not self.is_completed:
            self.is_completed = True
            self.completion_date = timezone.now()
            self.completion_method = method
            self.save()

            # Update overall course progress
            self._update_course_progress()

    def _update_course_progress(self):
        """Update the overall course progress percentage"""
        enrollment = self.enrollment
        course = enrollment.course

        # Count total lectures in course
        total_lectures = Lecture.objects.filter(section__course=course).count()

        # Count completed lectures for this enrollment
        completed_lectures = EnhancedLectureProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()

        # Calculate progress percentage
        if total_lectures > 0:
            progress_percentage = (completed_lectures / total_lectures) * 100
            enrollment.progress_percentage = progress_percentage

            # Mark course as completed if all lectures are done
            if progress_percentage >= 100:
                enrollment.status = 'completed'
                enrollment.completed_date = timezone.now()

            enrollment.save()

class CourseProgressSummary(BaseModel):
    """Summary of student's progress in a course"""

    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE,
                                     related_name='progress_summary')

    # Overall progress
    lectures_completed = models.IntegerField(default=0)
    lectures_total = models.IntegerField(default=0)
    videos_watched = models.IntegerField(default=0)
    readings_completed = models.IntegerField(default=0)

    # Assessment progress
    quizzes_attempted = models.IntegerField(default=0)
    quizzes_passed = models.IntegerField(default=0)
    assignments_submitted = models.IntegerField(default=0)
    assignments_graded = models.IntegerField(default=0)

    # Time tracking
    total_learning_time = models.IntegerField(default=0)  # seconds
    average_session_time = models.IntegerField(default=0)  # seconds
    last_activity_date = models.DateTimeField(null=True, blank=True)

    # Grade tracking
    current_grade = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    quiz_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    assignment_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        db_table = 'course_progress_summaries'

class StudentActivity(BaseModel):
    """Track student learning activities"""

    ACTIVITY_TYPES = (
        ('lecture_start', 'Started Lecture'),
        ('lecture_complete', 'Completed Lecture'),
        ('video_watch', 'Watched Video'),
        ('reading_complete', 'Completed Reading'),
        ('quiz_attempt', 'Attempted Quiz'),
        ('quiz_complete', 'Completed Quiz'),
        ('assignment_submit', 'Submitted Assignment'),
        ('note_create', 'Created Note'),
        ('bookmark_add', 'Added Bookmark'),
    )

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='learning_activities')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, null=True, blank=True)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)

    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    activity_data = models.JSONField(default=dict, blank=True)  # Additional activity metadata

    # Time tracking
    session_duration = models.IntegerField(default=0)  # seconds
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_activities'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['student', 'timestamp']),
            models.Index(fields=['course', 'activity_type']),
        ]