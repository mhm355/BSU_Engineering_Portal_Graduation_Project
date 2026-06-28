from rest_framework import serializers
from .models import News, NewsImage, NewsAttachment

class NewsImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsImage
        fields = ['id', 'image', 'created_at']

class NewsAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsAttachment
        fields = ['id', 'file', 'created_at']

class NewsSerializer(serializers.ModelSerializer):
    additional_images = NewsImageSerializer(many=True, read_only=True)
    additional_attachments = NewsAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = News
        fields = [
            'id', 'title', 'content', 'image', 'attachment',
            'created_by', 'creator_role', 'target_audience', 'status', 'created_at',
            'additional_images', 'additional_attachments',
        ]
        read_only_fields = ['created_by', 'creator_role']
