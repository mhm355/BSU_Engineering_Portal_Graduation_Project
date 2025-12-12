from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        STUDENT = "STUDENT", "Student"
        DOCTOR = "DOCTOR", "Doctor"
        STAFF = "STAFF", "Staff Affairs"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.STUDENT)
    national_id = models.CharField(max_length=14, unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.pk and not self.is_superuser:
            # Set default password to national_id or username if not provided
            if not self.password:
                self.set_password(self.national_id or self.username)
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
