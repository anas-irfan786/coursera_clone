# accounts/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    SignupSerializer, LoginSerializer, UserSerializer,
    StudentProfileSerializer, InstructorProfileSerializer
)
import secrets

# Get the User model
User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate email verification token
        user.email_verification_token = secrets.token_urlsafe(32)
        user.save(update_fields=['email_verification_token'])
        
        # TODO: Send verification email here
        # send_verification_email(user.email, user.email_verification_token)
        
        refresh = RefreshToken.for_user(user)
        
        # Add custom claims to token
        refresh['user_type'] = user.user_type
        refresh['uuid'] = str(user.uuid)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful! Please check your email to verify your account.'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(username=email, password=password)
        
        if user:
            if not user.is_active:
                return Response(
                    {'error': 'Your account has been deactivated. Please contact support.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update last login IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            user.last_login_ip = ip
            user.save(update_fields=['last_login_ip', 'last_login'])
            
            refresh = RefreshToken.for_user(user)
            
            # Add custom claims
            refresh['user_type'] = user.user_type
            refresh['uuid'] = str(user.uuid)
            
            # Get profile data based on user type
            profile_data = None
            if user.user_type == 'student' and hasattr(user, 'student_profile'):
                profile_data = StudentProfileSerializer(user.student_profile).data
            elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
                profile_data = InstructorProfileSerializer(user.instructor_profile).data
            
            return Response({
                'user': UserSerializer(user).data,
                'profile': profile_data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    user_data = UserSerializer(user).data
    
    # Get profile based on user type
    profile_data = None
    if user.user_type == 'student' and hasattr(user, 'student_profile'):
        profile_data = StudentProfileSerializer(user.student_profile).data
    elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        profile_data = InstructorProfileSerializer(user.instructor_profile).data
    
    return Response({
        'user': user_data,
        'profile': profile_data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    try:
        user = User.objects.get(email_verification_token=token)
        user.email_verified = True
        user.email_verification_token = None
        user.save(update_fields=['email_verified', 'email_verification_token'])
        return Response({'message': 'Email verified successfully!'})
    except User.DoesNotExist:
        return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)