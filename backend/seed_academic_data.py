import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from academic.models import Department, AcademicYear, Level, Course, TeachingAssignment
from django.contrib.auth import get_user_model

User = get_user_model()

def seed():
    print("Seeding academic data...")
    
    # Create Academic Year
    year, created = AcademicYear.objects.get_or_create(name="2024-2025", defaults={'is_current': True})
    print(f"Academic Year: {year.name}")

    # Create Department
    dept, created = Department.objects.get_or_create(name="Computer Science", code="CS", defaults={'description': 'CS Dept'})
    print(f"Department: {dept.name}")

    # Create Level
    level, created = Level.objects.get_or_create(name="Year 1", department=dept, academic_year=year)
    print(f"Level: {level.name}")

    # Create Course
    course, created = Course.objects.get_or_create(
        code="CS101",
        defaults={
            'name': "Introduction to CS",
            'department': dept,
            'level': level,
            'semester': '1',
            'credit_hours': 3
        }
    )
    print(f"Course: {course.name}")

    # Assign to Doctor
    try:
        doctor = User.objects.get(username='doctor')
        assignment, created = TeachingAssignment.objects.get_or_create(
            doctor=doctor,
            course=course,
            academic_year=year
        )
        print(f"Assigned {course.name} to {doctor.username}")
    except User.DoesNotExist:
        print("Doctor user not found!")

if __name__ == '__main__':
    seed()
