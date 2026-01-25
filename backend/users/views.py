from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from .serializers import UserSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            print(f"Login attempt: username={username}")
            
            user = authenticate(username=username, password=password)
            print(f"Authenticate result: {user}")
            
            if user:
                login(request, user)
                user_data = UserSerializer(user).data
                # Include first_login_required flag
                user_data['first_login_required'] = user.first_login_required
                return Response(user_data)
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"LOGIN CRASH: {error_details}")
            return Response({
                'error': 'Server Error during login',
                'details': str(e),
                'traceback': error_details
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
