from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        STUDENT = "STUDENT", "Student"
        DOCTOR = "DOCTOR", "Doctor"
        STUDENT_AFFAIRS = "STUDENT_AFFAIRS", "Student Affairs"
        STAFF_AFFAIRS = "STAFF_AFFAIRS", "Staff Affairs"

    class GraduationStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.STUDENT)
    national_id = models.CharField(max_length=14, unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    first_login_required = models.BooleanField(default=False)
    graduation_status = models.CharField(
        max_length=20, 
        choices=GraduationStatus.choices, 
        default=GraduationStatus.PENDING,
        blank=True
    )

    def save(self, *args, **kwargs):
        is_new = not self.pk
        if is_new and not self.is_superuser:
            # Set default password to national_id or username if not provided
            if not self.password or self.password == '!':
                self.set_password(self.national_id or self.username)
                # Require password change on first login for staff users AND students
                if self.role in ['STUDENT', 'STUDENT_AFFAIRS', 'STAFF_AFFAIRS', 'DOCTOR']:
                    self.first_login_required = True
        return super().save(*args, **kwargs)

    def get_absolute_url(self):
        if self.role == 'STUDENT':
            return reverse('student_dashboard')
        elif self.role == 'DOCTOR':
            return reverse('doctor_dashboard')
        elif self.role == 'STUDENT_AFFAIRS':
            return reverse('student_affairs_dashboard')
        elif self.role == 'STAFF_AFFAIRS':
            return reverse('staff_affairs_dashboard')
        elif self.role == 'ADMIN':
            return reverse('admin_dashboard')
        else:
            return reverse('home')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
