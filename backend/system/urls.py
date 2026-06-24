from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeleteRequestViewSet

router = DefaultRouter()
router.register(r'delete-requests', DeleteRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
