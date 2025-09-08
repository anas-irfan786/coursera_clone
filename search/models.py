# search/models.py
from django.db import models
from django.conf import settings
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from core.models import BaseModel

class SearchHistory(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                            related_name='search_history', null=True, blank=True)
    query = models.CharField(max_length=255)
    results_count = models.IntegerField(default=0)
    clicked_result = models.JSONField(default=dict, blank=True)
    session_id = models.CharField(max_length=255, blank=True)
    
    class Meta:
        db_table = 'search_history'
        ordering = ['-created_at']

class SavedSearch(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                            related_name='saved_searches')
    name = models.CharField(max_length=100)
    query = models.CharField(max_length=255)
    filters = models.JSONField(default=dict)
    
    # Notification settings
    notify_new_results = models.BooleanField(default=False)
    last_notified = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'saved_searches'
        unique_together = ['user', 'name']

class CourseRecommendation(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                            related_name='recommendations')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    
    # Recommendation metadata
    score = models.DecimalField(max_digits=5, decimal_places=2)
    reason = models.CharField(max_length=100)  # e.g., "Based on your interests"
    algorithm = models.CharField(max_length=50)  # e.g., "collaborative_filtering"
    
    # User interaction
    is_dismissed = models.BooleanField(default=False)
    is_clicked = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'course_recommendations'
        unique_together = ['user', 'course']
        ordering = ['-score']

class TrendingTopic(BaseModel):
    keyword = models.CharField(max_length=100, unique=True)
    search_count = models.IntegerField(default=0)
    enrollment_count = models.IntegerField(default=0)
    trend_score = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    
    # Time window
    period_start = models.DateField()
    period_end = models.DateField()
    
    class Meta:
        db_table = 'trending_topics'
        ordering = ['-trend_score']