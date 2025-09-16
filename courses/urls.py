# courses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import student_views

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
    
    #student URLs
    path('all/', student_views.all_courses, name='all-courses'),
    path('enrolled/', student_views.student_enrolled_courses, name='enrolled-courses'),
    path('<uuid:course_uuid>/enroll/', student_views.enroll_course, name='enroll-course'),
    path('<uuid:course_uuid>/bookmark/', student_views.bookmark_course, name='bookmark-course'),

     # Student stats and achievements
    path('student/stats/', student_views.student_stats, name='student-stats'),
    path('student/certificates/', student_views.student_certificates, name='student-certificates'),
    path('student/achievements/', student_views.student_achievements, name='student-achievements'),
    path('student/weekly-progress/', student_views.weekly_progress, name='weekly-progress'),

]