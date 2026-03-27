"""
Seed script for new academic features: Grading Template, Terms
Run: python manage.py shell < seed_academic_features.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from academic.models import AcademicYear, Term, GradingTemplate

print("=" * 50)
print("Seeding Academic Features")
print("=" * 50)

# Create default Grading Template
template, created = GradingTemplate.objects.get_or_create(
    name="النموذج الافتراضي",
    defaults={
        'attendance_weight': 10,
        'attendance_slots': 14,
        'quizzes_weight': 10,
        'quiz_count': 2,
        'coursework_weight': 10,
        'midterm_weight': 20,
        'final_weight': 50,
        'is_default': True,
    }
)
if created:
    print(f"✓ Created default Grading Template: {template.name}")
else:
    print(f"• Default Grading Template already exists: {template.name}")

# Create Terms for all Academic Years
years = AcademicYear.objects.all()
for year in years:
    for term_name in [Term.TermName.FIRST, Term.TermName.SECOND]:
        term, created = Term.objects.get_or_create(
            name=term_name,
            academic_year=year
        )
        if created:
            print(f"✓ Created Term: {term}")

print("\n" + "=" * 50)
print("Seeding Complete!")
print(f"Grading Templates: {GradingTemplate.objects.count()}")
print(f"Terms: {Term.objects.count()}")
print("=" * 50)
