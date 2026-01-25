from rest_framework import viewsets, permissions
from .models import News
from .serializers import NewsSerializer

class IsAdminOrStaff(permissions.BasePermission):
    """Allow Admin or Staff users."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'STAFF', 'STUDENT_AFFAIRS', 'STAFF_AFFAIRS']

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all().order_by('-created_at')
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """Automatically set created_by to the current user with error logging."""
        try:
            # Safely get user role if possible
            role = getattr(self.request.user, 'role', 'ADMIN')
            serializer.save(created_by=self.request.user, creator_role=role)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating news: {str(e)}")
            raise e

