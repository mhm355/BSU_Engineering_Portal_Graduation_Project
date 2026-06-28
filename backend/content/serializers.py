from rest_framework import serializers
from .models import News

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = [
            'id', 'title', 'content', 'image', 'attachment',
            'created_by', 'creator_role', 'target_audience', 'status', 'created_at',
        ]
        read_only_fields = ['created_by', 'creator_role']
