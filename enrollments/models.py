# enrollments/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from core.models import BaseModel
from courses.models import Course, Lecture, Section

class Enrollment(BaseModel):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
        ('refunded', 'Refunded'),
    )
    
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, 
                              related_name='enrollments')
    
    enrolled_date = models.DateTimeField(default=timezone.now)
    completed_date = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Tracking
    last_accessed = models.DateTimeField(null=True, blank=True)
    total_time_spent = models.IntegerField(default=0)  # in seconds
    
    # Certificate
    certificate_issued = models.BooleanField(default=False)
    certificate_issued_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'enrollments'
        unique_together = ['student', 'course']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['course', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.email} - {self.course.title}"

class LectureProgress(BaseModel):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE,
                                  related_name='lecture_progress')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE)
    
    is_completed = models.BooleanField(default=False)
    progress_seconds = models.IntegerField(default=0)  # For video lectures
    completed_date = models.DateTimeField(null=True, blank=True)
    
    # Video specific
    last_watched_position = models.IntegerField(default=0)  # in seconds
    watch_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'lecture_progress'
        unique_together = ['enrollment', 'lecture']
    
    def mark_completed(self):
        self.is_completed = True
        self.completed_date = timezone.now()
        self.save()

class CourseBookmark(BaseModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='bookmarks')
    course = models.ForeignKey(Course, on_delete=models.CASCADE,
                              related_name='bookmarks')
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'course_bookmarks'
        unique_together = ['student', 'course']

class LectureNote(BaseModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='lecture_notes')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE,
                               related_name='notes')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    
    note_content = models.TextField()
    timestamp = models.IntegerField(null=True, blank=True)  # Video timestamp in seconds
    
    class Meta:
        db_table = 'lecture_notes'
        ordering = ['-created_at']

class LearningStreak(BaseModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='learning_streaks')
    streak_date = models.DateField(unique=True)
    minutes_learned = models.IntegerField(default=0)
    courses_accessed = models.ManyToManyField(Course)
    
    class Meta:
        db_table = 'learning_streaks'
        unique_together = ['student', 'streak_date']
        ordering = ['-streak_date']