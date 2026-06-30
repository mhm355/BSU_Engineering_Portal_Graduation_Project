from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        STUDENT = "STUDENT", "Student"
        DOCTOR = "DOCTOR", "Doctor"
        STUDENT_AFFAIRS = "STUDENT_AFFAIRS", "Student Affairs"
        STAFF_AFFAIRS = "STAFF_AFFAIRS", "Staff Affairs"
        HOD = "HOD", "Head of Department"
        DEAN = "DEAN", "Dean"

    class GraduationStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    role = models.CharField(max_length=50, choices=Role.choices, default=Role.STUDENT)
    national_id = models.CharField(max_length=14, unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    department = models.ForeignKey('academic.Department', on_delete=models.SET_NULL, null=True, blank=True)
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
            if self.role in ['STUDENT', 'STUDENT_AFFAIRS', 'STAFF_AFFAIRS', 'DOCTOR', 'HOD', 'DEAN']:
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
        elif self.role == 'HOD':
            return '/hod/dashboard'  # Assuming frontend route, no reverse named yet
        elif self.role == 'DEAN':
            return '/dean/dashboard'
        elif self.role == 'ADMIN':
            return reverse('admin_dashboard')
        else:
            return reverse('home')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class PasswordResetRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_requests')
    reason = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='reviewed_password_requests'
    )

    def __str__(self):
        return f"Password Reset Request for {self.user.username} - {self.status}"
