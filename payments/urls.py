# payments/urls.py
from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('instructor/earnings/', views.instructor_earnings, name='instructor-earnings'),
]