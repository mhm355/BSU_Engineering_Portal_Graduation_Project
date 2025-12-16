from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, LogoutView, UserProfileView, UserViewSet, PublicStaffView, GetCSRFToken, ChangePasswordView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('csrf/', GetCSRFToken.as_view(), name='csrf'),
    path('public/staff/', PublicStaffView.as_view(), name='public-staff'),
    path('', include(router.urls)),
]

