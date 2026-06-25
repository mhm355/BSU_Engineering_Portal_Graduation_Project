from rest_framework import generics, permissions, status
from rest_framework.throttling import AnonRateThrottle
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserSerializer, RegisterSerializer
from .models import PasswordResetRequest

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user:
            login(request, user)
            user_data = UserSerializer(user).data
            # Include first_login_required flag
            user_data['first_login_required'] = user.first_login_required
            return Response(user_data)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})

from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({'success': 'CSRF cookie set'})

class PublicStaffView(APIView):
    """Public endpoint to list staff with department info"""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from academic.models import CourseOffering
        
        users = User.objects.filter(role__in=['DOCTOR', 'STAFF'])
        result = []
        
        for user in users:
            # Get department from first course offering
            dept_name = None
            offering = CourseOffering.objects.filter(doctor=user).select_related('level__department').first()
            if offering and offering.level and offering.level.department:
                dept_name = offering.level.department.name
            
            result.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'role': user.role,
                'department': dept_name,
            })
        
        return Response(result)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    """
    Change password endpoint - particularly for first login requirement.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Validate inputs
        if not current_password or not new_password or not confirm_password:
            return Response(
                {'error': 'All password fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check current password
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check new passwords match
        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check new password is not the same as national_id
        if user.national_id and new_password == user.national_id:
            return Response(
                {'error': 'New password cannot be the same as your National ID'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check minimum password length
        if len(new_password) < 6:
            return Response(
                {'error': 'Password must be at least 6 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update password
        user.set_password(new_password)
        user.first_login_required = False
        user.save()

        # Re-authenticate user with new password
        login(request, user)

        return Response({'message': 'Password changed successfully'})

from rest_framework import viewsets
from rest_framework.decorators import action
from .serializers import UserManagementSerializer
from django.contrib.auth import get_user_model
from .permissions import IsAdminRole
from .models import PasswordResetRequest

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserManagementSerializer
    permission_classes = [IsAdminRole]

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except Exception as e:
            # Check for ProtectedError (cannot import easily inside method without overhead, so strict checking is tricky, 
            # but usually it's raised as ProtectedError)
            if 'ProtectedError' in str(type(e)):
                 from rest_framework.exceptions import ValidationError
                 raise ValidationError({'error': 'لا يمكن حذف هذا المستخدم لأنه مرتبط ببيانات أخرى (مثل جداول محاضرات أو درجات).'})
            
            from rest_framework.exceptions import APIException
            raise APIException(f"Deletion failed: {str(e)}")

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """Reset user password to their national ID"""
        user = self.get_object()
        if hasattr(user, 'national_id') and user.national_id:
            user.set_password(user.national_id)
            user.first_login_required = True
            user.save()
            return Response({'message': 'تم إعادة تعيين كلمة المرور بنجاح'})
        return Response({'error': 'لا يمكن إعادة تعيين كلمة المرور - الرقم القومي غير موجود'}, 
                        status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """View to allow users to request a password reset"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List requests made by this user"""
        requests = PasswordResetRequest.objects.filter(user=request.user).order_by('-requested_at')
        result = []
        for req in requests:
            result.append({
                'id': req.id,
                'reason': req.reason,
                'status': req.status,
                'status_display': req.get_status_display(),
                'requested_at': req.requested_at,
            })
        return Response(result)

    def post(self, request):
        """Create a new password reset request"""
        # Check if already pending
        if PasswordResetRequest.objects.filter(user=request.user, status=PasswordResetRequest.Status.PENDING).exists():
            return Response(
                {'error': 'لديك طلب قيد الانتظار بالفعل'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        reason = request.data.get('reason', '')
        req = PasswordResetRequest.objects.create(user=request.user, reason=reason)
        
        return Response({
            'message': 'تم إرسال طلبك بنجاح',
            'id': req.id
        }, status=status.HTTP_201_CREATED)


class AdminPasswordResetRequestsView(APIView):
    """Admin view for approving/rejecting password reset requests"""
    permission_classes = [IsAdminRole]

    def get(self, request):
        """List all pending requests"""
        from django.utils import timezone
        
        status_filter = request.query_params.get('status', 'PENDING')
        requests = PasswordResetRequest.objects.filter(status=status_filter).select_related('user')
        
        result = []
        for req in requests:
            result.append({
                'id': req.id,
                'user_id': req.user.id,
                'user_name': f"{req.user.first_name} {req.user.last_name}".strip(),
                'user_role': req.user.get_role_display(),
                'national_id': req.user.national_id,
                'reason': req.reason,
                'status': req.status,
                'status_display': req.get_status_display(),
                'requested_at': req.requested_at,
            })
        return Response(result)

    def post(self, request, pk):
        """Approve or reject request"""
        from django.utils import timezone
        
        try:
            req = PasswordResetRequest.objects.get(id=pk)
            action = request.data.get('action')
            
            if action == 'approve':
                # Reset password to national ID
                user = req.user
                if user.national_id:
                    user.set_password(user.national_id)
                    user.first_login_required = True
                    user.save()
                    
                    req.status = PasswordResetRequest.Status.APPROVED
                    req.reviewed_at = timezone.now()
                    req.reviewed_by = request.user
                    req.save()
                    
                    return Response({'message': 'تم الموافقة على الطلب وإعادة تعيين كلمة المرور'})
                else:
                    return Response(
                        {'error': 'لا يوجد رقم قومي للمستخدم، لا يمكن إعادة تعيين كلمة المرور'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    
            elif action == 'reject':
                req.status = PasswordResetRequest.Status.REJECTED
                req.reviewed_at = timezone.now()
                req.reviewed_by = request.user
                req.save()
                return Response({'message': 'تم رفض الطلب'})
                
            else:
                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
                
        except PasswordResetRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

