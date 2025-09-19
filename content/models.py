# content/models.py
from django.db import models
from django.conf import settings
from core.models import BaseModel
from courses.models import Lecture

class VideoContent(BaseModel):
    lecture = models.OneToOneField(Lecture, on_delete=models.CASCADE,
                                  related_name='video_content')
    
    # Video files
    video_file = models.FileField(upload_to='lectures/videos/')
    video_url = models.URLField(blank=True)  # For external videos
    
    # Video metadata
    duration = models.IntegerField(default=0)  # in seconds
    resolution = models.CharField(max_length=20, blank=True)
    file_size = models.BigIntegerField(default=0)  # in bytes
    
    # Encoding status
    is_processed = models.BooleanField(default=False)
    processing_progress = models.IntegerField(default=0)
    
    # Streaming
    hls_playlist = models.FileField(upload_to='videos/hls/', blank=True, null=True)
    dash_manifest = models.FileField(upload_to='videos/dash/', blank=True, null=True)
    
    class Meta:
        db_table = 'video_content'

class VideoQuality(BaseModel):
    video = models.ForeignKey(VideoContent, on_delete=models.CASCADE,
                             related_name='qualities')
    quality = models.CharField(max_length=10)  # e.g., '1080p', '720p', '480p'
    file = models.FileField(upload_to='videos/qualities/')
    bitrate = models.IntegerField()  # in kbps
    file_size = models.BigIntegerField()  # in bytes
    
    class Meta:
        db_table = 'video_qualities'
        unique_together = ['video', 'quality']

class Subtitle(BaseModel):
    LANGUAGE_CHOICES = (
        ('en', 'English'),
        ('es', 'Spanish'),
        ('fr', 'French'),
        ('de', 'German'),
        ('zh', 'Chinese'),
        ('hi', 'Hindi'),
        ('ar', 'Arabic'),
    )
    
    video = models.ForeignKey(VideoContent, on_delete=models.CASCADE,
                             related_name='subtitles')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES)
    file = models.FileField(upload_to='lectures/subtitles/')
    is_auto_generated = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'subtitles'
        unique_together = ['video', 'language']

class Document(BaseModel):
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE,
                               related_name='documents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='documents/')
    file_type = models.CharField(max_length=10)  # pdf, docx, pptx, etc.
    file_size = models.BigIntegerField()  # in bytes
    
    is_downloadable = models.BooleanField(default=True)
    download_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'documents'

class ContentDownload(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                            related_name='downloads')
    document = models.ForeignKey(Document, on_delete=models.CASCADE,
                                related_name='download_records', null=True, blank=True)
    video = models.ForeignKey(VideoContent, on_delete=models.CASCADE,
                             related_name='download_records', null=True, blank=True)
    
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    
    class Meta:
        db_table = 'content_downloads'