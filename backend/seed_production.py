"""
Production Seed Script - Creates all necessary initial data for the system.
This script is idempotent (safe to run multiple times).

Run: python seed_production.py

NOTE: Academic Years, Terms, and Levels are NOT seeded here.
      - Admin creates Academic Years
      - Terms and Levels are auto-created when Academic Year is created
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from academic.models import Department, Specialization, GradingTemplate

User = get_user_model()

print("=" * 60)
print("BSU Engineering Portal - Production Seeding")
print("=" * 60)

# =============================================================================
# 1. DEPARTMENTS (Hardcoded - using consistent codes)
# =============================================================================
print("\n[1/3] Creating Departments...")

# IMPORTANT: Use codes that match seed_subjects.py and existing database
DEPARTMENTS = [
    ('PREP', 'الفرقة الإعدادية', True),   # is_preparatory=True
    ('ELEC', 'الهندسة الكهربية', False),
    ('MECH', 'الهندسة الميكانيكية', False),
    ('CIVIL', 'الهندسة المدنية', False),  # Use CIVIL not CVE
    ('ARCH', 'الهندسة المعمارية', False),  # Use ARCH not ARC
]

for code, name, is_prep in DEPARTMENTS:
    dept, created = Department.objects.get_or_create(
        code=code,
        defaults={'name': name, 'is_preparatory': is_prep}
    )
    if created:
        print(f"  ✓ Created: {name}")
    else:
        print(f"  • Exists: {name}")

# =============================================================================
# 2. SPECIALIZATIONS (for Electrical Engineering)
# =============================================================================
print("\n[2/3] Creating Specializations...")

elec_dept = Department.objects.filter(code='ELEC').first()
if elec_dept:
    SPECIALIZATIONS = [
        ('ECE', 'هندسة الإلكترونيات والاتصالات'),
        ('EPM', 'هندسة القوى والآلات الكهربية'),
    ]
    
    for code, name in SPECIALIZATIONS:
        spec, created = Specialization.objects.get_or_create(
            code=code,
            department=elec_dept,
            defaults={'name': name}
        )
        if created:
            print(f"  ✓ Created: {name}")
        else:
            print(f"  • Exists: {name}")

# =============================================================================
# 3. GRADING TEMPLATES
# =============================================================================
print("\n[3/3] Creating Grading Templates...")

TEMPLATES = [
    ("نموذج المواد النظرية (40-60-0)", 40, 60, 0, True),
    ("نموذج المواد العملية (30-50-20)", 30, 50, 20, False),
    ("نموذج المعامل (20-40-40)", 20, 40, 40, False),
    ("نموذج التصميم والمشاريع (50-30-20)", 50, 30, 20, False),
    ("نموذج العملي الكامل (30-30-40)", 30, 30, 40, False),
    ("نموذج متوازن (35-45-20)", 35, 45, 20, False),
    ("نموذج المقررات الاختيارية (40-26-34)", 40, 26, 34, False),
]

for name, coursework, written, practical, is_default in TEMPLATES:
    template, created = GradingTemplate.objects.get_or_create(
        name=name,
        defaults={
            'coursework_weight': coursework,
            'written_weight': written,
            'practical_weight': practical,
            'attendance_weight': 0,
            'quizzes_weight': 0,
            'midterm_weight': 0,
            'final_weight': 0,
            'is_default': is_default,
        }
    )
    if created:
        print(f"  ✓ Created: {name}")
    else:
        print(f"  • Exists: {name}")

# =============================================================================
# SUMMARY
# =============================================================================
print("\n" + "=" * 60)
print("Seeding Complete!")
print("=" * 60)
print(f"  Departments: {Department.objects.count()}")
print(f"  Specializations: {Specialization.objects.count()}")
print(f"  Grading Templates: {GradingTemplate.objects.count()}")
print("\n  NOTE: Academic Years, Terms, and Levels are created by Admin.")
print("=" * 60)
