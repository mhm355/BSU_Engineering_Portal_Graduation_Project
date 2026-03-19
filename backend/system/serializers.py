from rest_framework import serializers
from .models import DeleteRequest

class DeleteRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source='requested_by.username', read_only=True)

    class Meta:
        model = DeleteRequest
        fields = [
            'id', 'requested_by', 'requested_by_name',
            'item_type', 'item_id', 'reason',
            'created_at', 'is_approved', 'is_rejected',
        ]
        read_only_fields = ['requested_by', 'created_at', 'is_approved', 'is_rejected']
