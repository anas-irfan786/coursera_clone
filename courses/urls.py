# courses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('instructor/courses', views.InstructorCourseViewSet, basename='instructor-courses')

app_name = 'courses'

urlpatterns = [
    path('', include(router.urls)),
    path('instructor/dashboard/', views.instructor_dashboard, name='instructor-dashboard'),
    
    # Section management
    path('instructor/courses/<uuid:course_uuid>/sections/', 
         views.SectionViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='course-sections'),
    path('instructor/sections/<uuid:pk>/',
         views.SectionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
         name='section-detail'),
    
    # Lecture management  
    path('instructor/sections/<uuid:section_uuid>/lectures/',
         views.LectureViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='section-lectures'),
    path('instructor/lectures/<uuid:pk>/',
         views.LectureViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
         name='lecture-detail'),
]