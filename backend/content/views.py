from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
from .models import News
from .serializers import NewsSerializer

class IsAdminOrStaff(permissions.BasePermission):
    """Allow Admin or Staff users."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'STAFF', 'STUDENT_AFFAIRS', 'STAFF_AFFAIRS']

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.none()  # Required by DRF router; actual filtering in get_queryset()
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


    def get_queryset(self):
        qs = News.objects.all().order_by('-created_at')
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'role'):
            role = user.role
            # Admin/staff see all news
            if role in ['ADMIN', 'STAFF', 'STUDENT_AFFAIRS', 'STAFF_AFFAIRS']:
                return qs
            # Map user role to target_audience value
            role_map = {'STUDENT': 'STUDENTS', 'DOCTOR': 'DOCTORS'}
            audience = role_map.get(role, 'ALL')
            from django.db.models import Q
            qs = qs.filter(Q(target_audience='ALL') | Q(target_audience=audience))
        else:
            # Public (unauthenticated) — only show ALL audience
            qs = qs.filter(target_audience='ALL')
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrStaff()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        """Automatically set created_by and trigger notifications for targeted news."""
        import logging
        logger = logging.getLogger(__name__)
        try:
            role = getattr(self.request.user, 'role', 'ADMIN')
            news = serializer.save(created_by=self.request.user, creator_role=role)

            # Handle additional images and attachments
            new_images = self.request.FILES.getlist('new_images')
            new_attachments = self.request.FILES.getlist('new_attachments')
            from .models import NewsImage, NewsAttachment
            for img in new_images:
                NewsImage.objects.create(news=news, image=img)
            for att in new_attachments:
                NewsAttachment.objects.create(news=news, file=att)

            # U16: Auto-create Announcement notification when news targets a specific audience
            audience = news.target_audience  # 'ALL', 'STUDENTS', 'DOCTORS'
            if audience in ('STUDENTS', 'DOCTORS', 'ALL'):
                target_role_map = {
                    'STUDENTS': 'STUDENT',
                    'DOCTORS': 'DOCTOR',
                    'ALL': 'ALL',
                }
                target_role = target_role_map.get(audience, 'ALL')
                try:
                    from academic.models import Announcement
                    Announcement.objects.create(
                        title=f'خبر جديد: {news.title}',
                        message=news.content[:300] if news.content else news.title,
                        target_role=target_role,
                        created_by=self.request.user,
                        is_active=True,
                    )
                except Exception as ann_err:
                    logger.warning(f"Could not create announcement for news {news.id}: {ann_err}")

            # U9: Audit log for news creation
            try:
                from academic.models import AuditLog
                AuditLog.objects.create(
                    action='NEWS_CREATED',
                    performed_by=self.request.user,
                    entity_type='News',
                    entity_id=news.id,
                    details={'title': news.title, 'target_audience': news.target_audience}
                )
            except Exception:
                pass
        except Exception as e:
            logger.error(f"Error creating news: {str(e)}")
            raise e

    def perform_update(self, serializer):
        news = serializer.save()
        # Handle additional images and attachments
        new_images = self.request.FILES.getlist('new_images')
        new_attachments = self.request.FILES.getlist('new_attachments')
        from .models import NewsImage, NewsAttachment
        for img in new_images:
            NewsImage.objects.create(news=news, image=img)
        for att in new_attachments:
            NewsAttachment.objects.create(news=news, file=att)

    @action(detail=True, methods=['delete'], url_path='delete_media/(?P<media_type>image|attachment)/(?P<media_id>[^/.]+)')
    def delete_media(self, request, pk=None, media_type=None, media_id=None):
        news = self.get_object()
        from .models import NewsImage, NewsAttachment
        try:
            if media_type == 'image':
                media = NewsImage.objects.get(id=media_id, news=news)
            else:
                media = NewsAttachment.objects.get(id=media_id, news=news)
            media.delete()
            return Response({'status': 'deleted'}, status=status.HTTP_200_OK)
        except (NewsImage.DoesNotExist, NewsAttachment.DoesNotExist):
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

