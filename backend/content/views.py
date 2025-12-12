from rest_framework import viewsets, permissions
from .models import News
from .serializers import NewsSerializer

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all().order_by('-created_at')
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Import here to avoid circular import if needed, or just use IsAdminUser for now
            # But we want Staff too.
            from users.permissions import IsAdminRole, IsStaffRole
            return [IsAdminRole() | IsStaffRole()]
        return [permissions.AllowAny()]
