# assessments/models.py
from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from core.models import BaseModel
from courses.models import Course, Section, Lecture
from enrollments.models import Enrollment

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
    submission_file = models.FileField(upload_to='submissions/', blank=True, null=True)
    
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

class Rubric(BaseModel):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE,
                                  related_name='rubrics')
    criteria = models.CharField(max_length=200)
    description = models.TextField()
    max_points = models.IntegerField()
    
    class Meta:
        db_table = 'rubrics'