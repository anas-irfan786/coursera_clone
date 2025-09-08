# payments/instructor_views.py
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from datetime import datetime, timedelta
from .models import InstructorEarning
from accounts.models import InstructorProfile

class InstructorEarningsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'instructor':
            return Response({'error': 'Not an instructor'}, status=403)
        
        instructor = request.user
        
        # Get earnings summary
        total_earnings = InstructorEarning.objects.filter(
            instructor=instructor, is_paid=True
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        pending_earnings = InstructorEarning.objects.filter(
            instructor=instructor, is_paid=False
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        # This month's earnings
        current_month = datetime.now().replace(day=1)
        monthly_earnings = InstructorEarning.objects.filter(
            instructor=instructor,
            created_at__gte=current_month
        ).aggregate(Sum('net_amount'))['net_amount__sum'] or 0
        
        # Recent transactions
        recent_earnings = InstructorEarning.objects.filter(
            instructor=instructor
        ).order_by('-created_at')[:20].select_related('course', 'payment')
        
        transactions = []
        for earning in recent_earnings:
            transactions.append({
                'id': earning.uuid,
                'course': earning.course.title,
                'amount': earning.net_amount,
                'gross_amount': earning.gross_amount,
                'platform_fee': earning.platform_fee_amount,
                'status': 'Paid' if earning.is_paid else 'Pending',
                'date': earning.created_at,
                'student_email': earning.payment.user.email if earning.payment else None
            })
        
        # Monthly earnings chart (last 6 months)
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_data = InstructorEarning.objects.filter(
            instructor=instructor,
            created_at__gte=six_months_ago
        ).values('created_at__year', 'created_at__month').annotate(
            total=Sum('net_amount'),
            count=Count('id')
        ).order_by('created_at__year', 'created_at__month')
        
        # Update instructor profile
        profile, _ = InstructorProfile.objects.get_or_create(user=instructor)
        profile.earnings_total = total_earnings
        profile.earnings_pending = pending_earnings
        profile.save()
        
        return Response({
            'summary': {
                'total_earnings': total_earnings,
                'pending_earnings': pending_earnings,
                'monthly_earnings': monthly_earnings,
                'platform_fee_rate': 30,  # 30% platform fee
            },
            'recent_transactions': transactions,
            'monthly_chart': list(monthly_data),
            'payout_info': {
                'payout_method': profile.payout_method,
                'payout_email': profile.payout_email
            }
        })