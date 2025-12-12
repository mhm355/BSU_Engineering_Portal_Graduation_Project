from django.db import models
from django.conf import settings

class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class AcademicYear(models.Model):
    name = models.CharField(max_length=20) # e.g., "2024-2025"
    is_current = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Level(models.Model):
    name = models.CharField(max_length=50) # e.g., "First Year"
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='levels')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} - {self.department.name} ({self.academic_year.name})"

class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    semester = models.CharField(max_length=20, choices=[('1', 'First'), ('2', 'Second')])
    credit_hours = models.IntegerField(default=3)

    def __str__(self):
        return f"{self.name} ({self.code})"

class TeachingAssignment(models.Model):
    doctor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'DOCTOR'})
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('doctor', 'course', 'academic_year')

    def __str__(self):
        return f"{self.doctor.username} - {self.course.name}"

class StudentEnrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'})
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.student.username} - {self.level.name}"

class Grade(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    grade_letter = models.CharField(max_length=2, blank=True) # A, B, C...

    def save(self, *args, **kwargs):
        # Auto-calculate letter grade
        s = float(self.score)
        if s >= 90: self.grade_letter = 'A'
        elif s >= 85: self.grade_letter = 'A-'
        elif s >= 80: self.grade_letter = 'B+'
        elif s >= 75: self.grade_letter = 'B'
        elif s >= 70: self.grade_letter = 'C+'
        elif s >= 65: self.grade_letter = 'C'
        elif s >= 60: self.grade_letter = 'D'
        else: self.grade_letter = 'F'
        super().save(*args, **kwargs)

class Attendance(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=[('PRESENT', 'Present'), ('ABSENT', 'Absent')])

class Exam(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    duration_minutes = models.IntegerField()
    location = models.CharField(max_length=100)

    def __str__(self):
        return f"Exam: {self.course.name} on {self.date}"

class CourseMaterial(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='course_materials/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.course.name})"

class Certificate(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'})
    file = models.FileField(upload_to='certificates/')
    issued_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Certificate for {self.student.username}"

