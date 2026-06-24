from django.db import models
from django.conf import settings

class News(models.Model):
    class TargetAudience(models.TextChoices):
        ALL = "ALL", "All"
        STUDENTS = "STUDENTS", "Students"
        DOCTORS = "DOCTORS", "Doctors"

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"

    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='news_images/', null=True, blank=True)
    attachment = models.FileField(upload_to='news_attachments/', null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='news_items',
        null=True,
        blank=True
    )
    creator_role = models.CharField(max_length=50, blank=True)  # ADMIN, STAFF
    target_audience = models.CharField(
        max_length=20, 
        choices=TargetAudience.choices, 
        default=TargetAudience.ALL
    )
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PUBLISHED
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "News"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.created_by and not self.creator_role:
            self.creator_role = self.created_by.role
        super().save(*args, **kwargs)

