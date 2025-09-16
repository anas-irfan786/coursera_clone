#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coursera.settings')
django.setup()

from django.urls import reverse
from rest_framework.routers import DefaultRouter
from courses.views import InstructorCourseViewSet

def test_urls():
    # Test router setup
    router = DefaultRouter()
    router.register('instructor/courses', InstructorCourseViewSet, basename='instructor-courses')
    
    print("Registered URLs from router:")
    for pattern in router.urls:
        print(f"  {pattern.pattern}")
    
    # Test URL reversing
    try:
        # Test standard ViewSet URLs
        list_url = reverse('courses:instructor-courses-list')
        print(f"List URL: {list_url}")
        
        # Test detail URL
        detail_url = reverse('courses:instructor-courses-detail', kwargs={'pk': 'test-uuid'})
        print(f"Detail URL: {detail_url}")
        
        # Test custom action URLs
        try:
            delete_url = reverse('courses:instructor-courses-delete-course', kwargs={'pk': 'test-uuid'})
            print(f"Delete action URL: {delete_url}")
        except Exception as e:
            print(f"Delete action URL error: {e}")
            
        try:
            publish_url = reverse('courses:instructor-courses-publish', kwargs={'pk': 'test-uuid'})
            print(f"Publish action URL: {publish_url}")
        except Exception as e:
            print(f"Publish action URL error: {e}")
        
    except Exception as e:
        print(f"URL reversing error: {e}")

if __name__ == '__main__':
    test_urls()