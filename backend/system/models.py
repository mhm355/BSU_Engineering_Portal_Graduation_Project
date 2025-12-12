from django.db import models
from django.conf import settings

class DeleteRequest(models.Model):
    REQUEST_TYPES = [
        ('STUDENT', 'Student'),
        ('LEVEL', 'Level'),
        ('YEAR', 'Academic Year'),
        ('DEPARTMENT', 'Department'),
        ('COURSE', 'Course'),
    ]

    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='delete_requests')
    item_type = models.CharField(max_length=20, choices=REQUEST_TYPES)
    item_id = models.IntegerField() # ID of the item to be deleted
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)

    def __str__(self):
        return f"Delete {self.item_type} #{self.item_id} by {self.requested_by.username}"
