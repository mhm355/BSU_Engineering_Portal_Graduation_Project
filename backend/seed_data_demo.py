#!/usr/bin/env python
"""
Seed script to create Course Offerings, Attendance, and Certificates for demo purposes.
Ensure this runs AFTER:
1. seed_structure.py
2. seed_subjects.py
3. seed_users.py (or seed_faculty_students.py)
"""
import os
import random
import datetime
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from academic.models import (
    Department, AcademicYear, Level, Term, Subject, 
    CourseOffering, Student, Attendance, Certificate, Specialization
)

User = get_user_model()

def create_course_offerings():
    print("\n=== Seeding Course Offerings ===\n")
    
    try:
        current_year = AcademicYear.objects.get(is_current=True)
    except AcademicYear.DoesNotExist:
        # Fallback if no current year
        current_year = AcademicYear.objects.first()
        if not current_year:
            print("No academic year found.")
            return

    # Get valid terms
    terms = Term.objects.filter(academic_year=current_year)
    if not terms.exists():
        print("No terms found.")
        return

    # Get doctors
    doctors = User.objects.filter(role='DOCTOR')
    if not doctors.exists():
        # Create a fallback doctor if none exist
        default_doctor = User.objects.create_user(
            username='dr_fallback',
            password='password123',
            role='DOCTOR',
            first_name='Fallback',
            last_name='Doctor'
        )
        doctors = [default_doctor]

    subjects = Subject.objects.all()
    created_count = 0

    for subject in subjects:
        # Determine strict level matching
        # Subject level is string ('FIRST', 'SECOND'...)
        # We need Level object matchin Department + Year + Level Name
        level_name = subject.level
        department = subject.department
        
        try:
            level = Level.objects.get(
                name=level_name, 
                department=department, 
                academic_year=current_year
            )
        except Level.DoesNotExist:
            continue

        # Determine Term (Subject semester 1 -> Term FIRST, 2 -> Term SECOND)
        term_name = 'FIRST' if subject.semester == 1 else 'SECOND'
        term = terms.filter(name=term_name).first()
        if not term:
            continue

        # Check if offering exists
        if CourseOffering.objects.filter(subject=subject, academic_year=current_year).exists():
            continue

        # Assign random doctor
        doctor = random.choice(doctors)
        
        # Grading Template? (Optional, assumed null or default)

        CourseOffering.objects.create(
            subject=subject,
            academic_year=current_year,
            term=term,
            level=level,
            doctor=doctor,
            specialization=subject.specialization
        )
        created_count += 1
    
    print(f"Created {created_count} Course Offerings.")

def seed_attendance():
    print("\n=== Seeding Attendance ===\n")
    
    # Pick a few active offerings
    offerings = CourseOffering.objects.all()[:20] # First 20 courses
    
    created_count = 0
    today = timezone.localtime().date()
    
    for offering in offerings:
        # Get students in this level/specialization
        students = Student.objects.filter(level=offering.level)
        if offering.specialization:
            students = students.filter(specialization=offering.specialization)
        
        if not students.exists():
            continue

        # Generate attendance for last 4 weeks (once a week)
        for i in range(4):
            date = today - datetime.timedelta(weeks=i)
            # Find closest weekday (e.g. Sunday)
            # Just use the date for simplicity
            
            for student in students:
                # Random status
                status = 'PRESENT' if random.random() > 0.2 else 'ABSENT'
                
                Attendance.objects.get_or_create(
                    student=student,
                    course_offering=offering,
                    date=date,
                    defaults={'status': status}
                )
                created_count += 1

    print(f"Created {created_count} Attendance records.")

def seed_certificates():
    print("\n=== Seeding Certificates ===\n")
    
    # Target Fourth Year students
    students = Student.objects.filter(level__name='FOURTH')
    created_count = 0
    
    for student in students:
        # 30% chance to have a certificate
        if random.random() > 0.7:
             # Ensure student has a user
             if not student.user:
                 continue
                 
             # Fake file path (in media/certificates usually)
             # We rely on existing file or just string path
             Certificate.objects.get_or_create(
                 student=student.user,
                 defaults={
                     'file': 'defaults/certificate_placeholder.pdf', 
                     'description': 'شهادة التخرج - دور مايو 2024'
                 }
             )
             created_count += 1

    print(f"Created {created_count} Certificates.")

if __name__ == '__main__':
    create_course_offerings()
    seed_attendance()
    seed_certificates()
