"""
Security utilities and middleware for the Coursera application.
"""
import re
import logging
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from django.core.exceptions import PermissionDenied
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from collections import defaultdict
import time

logger = logging.getLogger(__name__)

class SecurityMiddleware(MiddlewareMixin):
    """
    Custom security middleware to add additional security headers and validations
    """

    def process_response(self, request, response):
        """Add security headers to all responses"""
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.gstatic.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "media-src 'self' blob:; "
            "frame-src 'self' https://www.youtube.com; "
            "connect-src 'self';"
        )
        response['Content-Security-Policy'] = csp

        # Additional security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Prevent caching of sensitive data
        if request.path.startswith('/api/') and 'gradebook' in request.path:
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'

        return response

class InputValidationMixin:
    """
    Mixin to validate user inputs and prevent common attacks
    """

    @staticmethod
    def sanitize_input(input_string, max_length=1000):
        """
        Sanitize user input to prevent XSS and injection attacks
        """
        if not input_string:
            return input_string

        # Truncate if too long
        input_string = str(input_string)[:max_length]

        # Remove potentially dangerous patterns
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'vbscript:',
            r'onload\s*=',
            r'onerror\s*=',
            r'onclick\s*=',
        ]

        for pattern in dangerous_patterns:
            input_string = re.sub(pattern, '', input_string, flags=re.IGNORECASE | re.DOTALL)

        return input_string

    @staticmethod
    def validate_file_upload(uploaded_file):
        """
        Validate uploaded files for security
        """
        if not uploaded_file:
            return True, None

        # Check file size (50MB max)
        if uploaded_file.size > 50 * 1024 * 1024:
            return False, "File size cannot exceed 50MB"

        # Check filename
        filename = uploaded_file.name
        if not filename:
            return False, "Filename is required"

        # Sanitize filename
        if not re.match(r'^[a-zA-Z0-9._-]+$', filename):
            return False, "Filename contains invalid characters"

        # Check file extension
        allowed_extensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.jpg', '.jpeg', '.png', '.gif', '.pptx', '.xlsx']
        file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
        if f'.{file_extension}' not in allowed_extensions:
            return False, f"File type .{file_extension} not allowed"

        return True, None

class RateLimitMiddleware(MiddlewareMixin):
    """
    Simple rate limiting middleware
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.request_counts = defaultdict(list)
        self.limits = {
            '/api/accounts/login/': (5, 300),  # 5 requests per 5 minutes
            '/api/accounts/signup/': (3, 300),  # 3 requests per 5 minutes
            '/api/courses/': (100, 60),  # 100 requests per minute
        }

    def __call__(self, request):
        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        # Check if path should be rate limited
        path = request.path
        for limited_path, (max_requests, window) in self.limits.items():
            if path.startswith(limited_path):
                key = f"{ip}:{limited_path}"
                current_time = time.time()

                # Clean old requests
                self.request_counts[key] = [
                    req_time for req_time in self.request_counts[key]
                    if current_time - req_time < window
                ]

                # Check limit
                if len(self.request_counts[key]) >= max_requests:
                    logger.warning(f"Rate limit exceeded for {ip} on {path}")
                    return HttpResponseForbidden("Rate limit exceeded")

                # Add current request
                self.request_counts[key].append(current_time)

        response = self.get_response(request)
        return response

def check_permission_ownership(user, obj, permission_type='read'):
    """
    Check if user has permission to access the object
    """
    if user.is_admin:
        return True

    # Check object ownership based on type
    if hasattr(obj, 'instructor') and obj.instructor == user:
        return True

    if hasattr(obj, 'student') and obj.student == user:
        return True

    if hasattr(obj, 'user') and obj.user == user:
        return True

    # Check enrollment for courses
    if hasattr(obj, 'course'):
        from enrollments.models import Enrollment
        if user.user_type == 'student':
            return Enrollment.objects.filter(
                student=user,
                course=obj.course,
                status='active'
            ).exists()
        elif user.user_type == 'instructor' and obj.course.instructor == user:
            return True

    return False

def sanitize_search_query(query):
    """
    Sanitize search queries to prevent injection attacks
    """
    if not query:
        return ""

    # Remove dangerous characters and limit length
    query = re.sub(r'[<>"\';\\&]', '', str(query)[:100])

    # Remove SQL injection patterns
    sql_patterns = ['union', 'select', 'insert', 'update', 'delete', 'drop', '--', '/*', '*/', 'xp_']
    for pattern in sql_patterns:
        query = re.sub(pattern, '', query, flags=re.IGNORECASE)

    return query.strip()