from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, LogoutView, UserProfileView, UserViewSet, PublicStaffView, GetCSRFToken, ChangePasswordView, UploadUsersView, PasswordResetRequestView, AdminPasswordResetRequestsView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/users/upload/', UploadUsersView.as_view(), name='admin-upload-users'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('admin/password-resets/', AdminPasswordResetRequestsView.as_view(), name='admin-password-resets'),
    path('admin/password-resets/<int:pk>/', AdminPasswordResetRequestsView.as_view(), name='admin-password-resets-action'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('csrf/', GetCSRFToken.as_view(), name='csrf'),
    path('public/staff/', PublicStaffView.as_view(), name='public-staff'),
    path('', include(router.urls)),
]

