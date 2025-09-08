from django.db import models
from django.conf import settings
from core.models import BaseModel
from courses.models import Course, Lecture

class DiscussionThread(BaseModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, 
                              related_name='discussion_threads')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE,
                               null=True, blank=True, related_name='discussions')
    
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name='discussion_threads')
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    # Stats
    view_count = models.IntegerField(default=0)
    reply_count = models.IntegerField(default=0)
    
    # Status
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_resolved = models.BooleanField(default=False)
    
    # Tags
    is_question = models.BooleanField(default=False)
    is_announcement = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'discussion_threads'
        ordering = ['-is_pinned', '-created_at']

class DiscussionReply(BaseModel):
    thread = models.ForeignKey(DiscussionThread, on_delete=models.CASCADE,
                              related_name='replies')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name='discussion_replies')
    parent_reply = models.ForeignKey('self', null=True, blank=True,
                                    on_delete=models.CASCADE, related_name='child_replies')
    
    content = models.TextField()
    
    is_solution = models.BooleanField(default=False)
    is_instructor_reply = models.BooleanField(default=False)
    
    # Votes
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)
    
    # Edit tracking
    edited_at = models.DateTimeField(null=True, blank=True)
    edit_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'discussion_replies'
        ordering = ['created_at']

class DiscussionVote(BaseModel):
    VOTE_CHOICES = (
        ('up', 'Upvote'),
        ('down', 'Downvote'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reply = models.ForeignKey(DiscussionReply, on_delete=models.CASCADE,
                             related_name='votes')
    vote_type = models.CharField(max_length=4, choices=VOTE_CHOICES)
    
    class Meta:
        db_table = 'discussion_votes'
        unique_together = ['user', 'reply']

class DirectMessage(BaseModel):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                              related_name='sent_messages')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 related_name='received_messages')
    
    subject = models.CharField(max_length=200)
    content = models.TextField()
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # For threading
    parent_message = models.ForeignKey('self', null=True, blank=True,
                                      on_delete=models.SET_NULL, related_name='replies')
    
    class Meta:
        db_table = 'direct_messages'
        ordering = ['-created_at']