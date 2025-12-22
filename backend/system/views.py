from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DeleteRequest
from .serializers import DeleteRequestSerializer
from academic.models import Department, AcademicYear, Level, Subject
from users.models import User
from users.permissions import IsAdminRole

class DeleteRequestViewSet(viewsets.ModelViewSet):
    queryset = DeleteRequest.objects.all()
    serializer_class = DeleteRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return DeleteRequest.objects.all().order_by('-created_at')
        return DeleteRequest.objects.filter(requested_by=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def approve(self, request, pk=None):
        delete_request = self.get_object()
        if delete_request.is_approved or delete_request.is_rejected:
            return Response({'error': 'Request already processed'}, status=400)

        try:
            model_map = {
                'DEPARTMENT': Department,
                'YEAR': AcademicYear,
                'LEVEL': Level,
                'SUBJECT': Subject,
                'STUDENT': User,
            }
            # The model uses uppercase choices: STUDENT, LEVEL, etc.
            model = model_map.get(delete_request.item_type)
            
            if model:
                try:
                    item = model.objects.get(pk=delete_request.item_id)
                    item.delete()
                    delete_request.is_approved = True
                    delete_request.save()
                    return Response({'status': 'Approved and deleted'})
                except model.DoesNotExist:
                    delete_request.is_approved = True
                    delete_request.save()
                    return Response({'status': 'Item already deleted, request marked approved'})
            else:
                return Response({'error': f'Invalid item type: {delete_request.item_type}'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def reject(self, request, pk=None):
        delete_request = self.get_object()
        if delete_request.is_approved or delete_request.is_rejected:
            return Response({'error': 'Request already processed'}, status=400)
        
        delete_request.is_rejected = True
        delete_request.save()
        return Response({'status': 'Rejected'})
