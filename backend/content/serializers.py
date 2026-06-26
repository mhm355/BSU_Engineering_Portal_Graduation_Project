from rest_framework import serializers
from .models import News

class NewsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    attachment = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = [
            'id', 'title', 'content', 'image', 'attachment',
            'created_by', 'creator_role', 'target_audience', 'status', 'created_at',
        ]
        read_only_fields = ['created_by', 'creator_role']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def get_attachment(self, obj):
        if obj.attachment:
            return obj.attachment.url
        return None
