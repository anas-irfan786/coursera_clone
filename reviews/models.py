from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import BaseModel
from courses.models import Course
from enrollments.models import Enrollment

class CourseReview(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='course_reviews')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE,
                                  related_name='review', null=True, blank=True)
    
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    comment = models.TextField()
    
    # Instructor response
    instructor_response = models.TextField(blank=True)
    instructor_response_date = models.DateTimeField(null=True, blank=True)
    
    # Helpful votes
    helpful_count = models.IntegerField(default=0)
    not_helpful_count = models.IntegerField(default=0)
    
    # Status
    is_verified_purchase = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_reported = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'course_reviews'
        unique_together = ['course', 'student']
        ordering = ['-created_at']

class ReviewHelpful(BaseModel):
    review = models.ForeignKey(CourseReview, on_delete=models.CASCADE,
                              related_name='helpful_votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_helpful = models.BooleanField()
    
    class Meta:
        db_table = 'review_helpful_votes'
        unique_together = ['review', 'user']

class InstructorRating(BaseModel):
    instructor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                  related_name='instructor_ratings')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                               related_name='given_instructor_ratings')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    
    class Meta:
        db_table = 'instructor_ratings'
        unique_together = ['instructor', 'student', 'course']