# assessments/models.py
from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.exceptions import ValidationError
from django.utils import timezone
from core.models import BaseModel
from courses.models import Course, Section, Lecture
from enrollments.models import Enrollment
import os
import uuid
from django.core.files.storage import default_storage

def assignment_upload_path(instance, filename):
    """Generate secure upload path for assignment submissions"""
    # Get file extension
    ext = filename.split('.')[-1].lower()

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}.{ext}"

    # Create path: assignment_uploads/course_id/assignment_id/student_id/filename
    return f"assignment_uploads/{instance.assignment.course.uuid}/{instance.assignment.uuid}/{instance.student.uuid}/{unique_filename}"

class Quiz(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    section = models.ForeignKey(Section, on_delete=models.CASCADE,
                               related_name='quizzes', null=True, blank=True)
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE,
                               related_name='quiz', null=True, blank=True)
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Settings
    passing_score = models.IntegerField(default=60)  # Percentage
    time_limit = models.IntegerField(null=True, blank=True)  # in minutes
    max_attempts = models.IntegerField(default=3)
    randomize_questions = models.BooleanField(default=False)
    show_answers = models.BooleanField(default=True)
    
    # Weight in final grade
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'quizzes'
        verbose_name_plural = 'Quizzes'

class Question(BaseModel):
    QUESTION_TYPE_CHOICES = (
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('multiple_select', 'Multiple Select'),
        ('fill_blank', 'Fill in the Blank'),
        ('essay', 'Essay'),
    )
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    
    # For ordering
    order = models.IntegerField(default=0)
    points = models.IntegerField(default=1)
    
    # For fill in the blank
    correct_answers = models.JSONField(default=list, blank=True)  # List of acceptable answers
    
    explanation = models.TextField(blank=True)  # Shown after answering
    
    class Meta:
        db_table = 'questions'
        ordering = ['order']

class QuestionOption(BaseModel):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'question_options'
        ordering = ['order']

class QuizAttempt(BaseModel):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    
    attempt_number = models.IntegerField(default=1)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    passed = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'quiz_attempts'
        unique_together = ['student', 'quiz', 'attempt_number']

    def clean(self):
        """Validate quiz attempt rules"""
        # Check if student is enrolled in the course
        from enrollments.models import Enrollment
        try:
            enrollment = Enrollment.objects.get(
                student=self.student,
                course=self.quiz.course,
                status='active'
            )
            self.enrollment = enrollment
        except Enrollment.DoesNotExist:
            raise ValidationError("Must be enrolled in course to attempt quiz")

        # Check max attempts
        existing_attempts = QuizAttempt.objects.filter(
            student=self.student,
            quiz=self.quiz
        ).count()

        if existing_attempts >= self.quiz.max_attempts:
            raise ValidationError(f"Maximum {self.quiz.max_attempts} attempts exceeded")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class QuestionResponse(BaseModel):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE,
                               related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    
    # For multiple choice/select
    selected_options = models.ManyToManyField(QuestionOption, blank=True)
    
    # For text answers
    text_answer = models.TextField(blank=True)
    
    is_correct = models.BooleanField(null=True, blank=True)
    points_earned = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'question_responses'
        unique_together = ['attempt', 'question']

class Assignment(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    section = models.ForeignKey(Section, on_delete=models.CASCADE,
                               related_name='assignments', null=True, blank=True)
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE,
                               related_name='assignment', null=True, blank=True)

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    instructions = models.TextField()

    # Grading Settings
    max_points = models.IntegerField(default=100)
    passing_score = models.IntegerField(default=60)  # Percentage
    weight = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # Weight in final grade
    due_date = models.DateTimeField(null=True, blank=True)

    # Files
    attachment = models.FileField(upload_to='lectures/assignments/', blank=True, null=True)

    # Submission settings
    allow_late_submission = models.BooleanField(default=True)
    late_penalty_percent = models.IntegerField(default=10)

    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'assignments'

class AssignmentSubmission(BaseModel):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE,
                                  related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='assignment_submissions')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE)
    
    submission_text = models.TextField(blank=True)
    submission_file = models.FileField(upload_to=assignment_upload_path, blank=True, null=True)
    original_filename = models.CharField(max_length=255, blank=True)  # Store original filename
    
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)
    
    # Grading
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                  null=True, blank=True, related_name='graded_assignments')
    graded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'assignment_submissions'
        unique_together = ['assignment', 'student']

    def clean(self):
        """Validate assignment submission rules"""
        # Check if student is enrolled in the course
        from enrollments.models import Enrollment
        try:
            enrollment = Enrollment.objects.get(
                student=self.student,
                course=self.assignment.course,
                status='active'
            )
            self.enrollment = enrollment
        except Enrollment.DoesNotExist:
            raise ValidationError("Must be enrolled in course to submit assignment")

        # Check file size (50MB limit)
        if self.submission_file and self.submission_file.size > 50 * 1024 * 1024:
            raise ValidationError("File size cannot exceed 50MB")

        # Validate file extension for security
        if self.submission_file:
            allowed_extensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.rar', '.7z', '.pptx', '.xlsx']
            file_extension = os.path.splitext(self.submission_file.name)[1].lower()
            if file_extension not in allowed_extensions:
                raise ValidationError(f"File type {file_extension} not allowed. Allowed types: {', '.join(allowed_extensions)}")

            # Additional security: Check for dangerous filenames
            dangerous_patterns = ['..', '/', '\\', '<script', '<?php', '.exe', '.bat', '.cmd', '.sh']
            filename = self.submission_file.name.lower()
            for pattern in dangerous_patterns:
                if pattern in filename:
                    raise ValidationError("Filename contains unsafe characters or patterns")

        # Check if assignment is still accepting submissions
        if self.assignment.due_date and timezone.now() > self.assignment.due_date:
            if not self.assignment.allow_late_submission:
                raise ValidationError("Assignment deadline has passed")
            else:
                self.is_late = True

    def save(self, *args, **kwargs):
        # Store original filename if file is uploaded
        if self.submission_file and not self.original_filename:
            self.original_filename = self.submission_file.name

        self.full_clean()
        super().save(*args, **kwargs)

class Rubric(BaseModel):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE,
                                  related_name='rubrics')
    criteria = models.CharField(max_length=200)
    description = models.TextField()
    max_points = models.IntegerField()
    
    class Meta:
        db_table = 'rubrics'