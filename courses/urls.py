# courses/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from . import views
from . import student_views

router = DefaultRouter()
router.register('instructor/courses', views.InstructorCourseViewSet, basename='instructor-courses')

# Create wrapper functions for reordering endpoints
@api_view(['POST'])
@permission_classes([views.IsInstructor])
def reorder_sections_wrapper(request, course_uuid):
    viewset = views.SectionViewSet()
    viewset.request = request
    viewset.kwargs = {'course_uuid': course_uuid}
    return viewset.reorder_sections(request, course_uuid)

@api_view(['POST'])
@permission_classes([views.IsInstructor])
def reorder_lectures_wrapper(request, section_uuid):
    viewset = views.LectureViewSet()
    viewset.request = request
    viewset.kwargs = {'section_uuid': section_uuid}
    return viewset.reorder_lectures(request, section_uuid)

app_name = 'courses'

urlpatterns = [
    path('', include(router.urls)),
    path('instructor/dashboard/', views.instructor_dashboard, name='instructor-dashboard'),
    
    # Section management
    path('instructor/courses/<uuid:course_uuid>/sections/',
         views.SectionViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='course-sections'),
    path('instructor/courses/<uuid:course_uuid>/sections/reorder/',
         reorder_sections_wrapper,
         name='reorder-sections'),
    path('instructor/sections/<uuid:uuid>/',
         views.SectionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
         name='section-detail'),

    # Lecture management
    path('instructor/sections/<uuid:section_uuid>/lectures/',
         views.LectureViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='section-lectures'),
    path('instructor/sections/<uuid:section_uuid>/lectures/reorder/',
         reorder_lectures_wrapper,
         name='reorder-lectures'),
    path('instructor/lectures/<uuid:uuid>/',
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