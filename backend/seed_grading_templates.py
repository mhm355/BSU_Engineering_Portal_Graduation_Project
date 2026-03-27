"""
Seed script for grading templates based on reference tables.
Run: docker exec bsu_backend python manage.py shell < seed_grading_templates.py

This script creates grading templates based on common patterns from the
subject grade tables and assigns them to subjects.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from academic.models import GradingTemplate, Subject

print("=" * 60)
print("Seeding Grading Templates")
print("=" * 60)

# Common grading template patterns from reference tables
# Format: (name, coursework_weight, written_weight, practical_weight)
TEMPLATES = [
    # Most common pattern for theoretical subjects
    ("نموذج المواد النظرية (40-60-0)", 40, 60, 0),
    
    # Pattern for subjects with practical component
    ("نموذج المواد العملية (30-50-20)", 30, 50, 20),
    
    # Pattern for lab-heavy subjects
    ("نموذج المعامل (20-40-40)", 20, 40, 40),
    
    # Pattern for design/project subjects
    ("نموذج التصميم والمشاريع (50-30-20)", 50, 30, 20),
    
    # Pattern for pure practical subjects
    ("نموذج العملي الكامل (30-30-40)", 30, 30, 40),
    
    # Balanced pattern
    ("نموذج متوازن (35-45-20)", 35, 45, 20),
    
    # Pattern for elective courses (from image)
    ("نموذج المقررات الاختيارية (40-26-34)", 40, 26, 34),
]

created_templates = []
for name, coursework, written, practical in TEMPLATES:
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
            'is_default': False,
        }
    )
    if created:
        print(f"✓ Created template: {name}")
        created_templates.append(template)
    else:
        print(f"• Template already exists: {name}")

# Set the first template as default
default_template = GradingTemplate.objects.filter(name__contains="نموذج المواد النظرية").first()
if default_template:
    GradingTemplate.objects.update(is_default=False)
    default_template.is_default = True
    default_template.save()
    print(f"\n✓ Set default template: {default_template.name}")

# Assign templates to subjects based on characteristics
# This is a smart assignment based on subject properties
subjects = Subject.objects.filter(default_grading_template__isnull=True)

# Get templates
theoretical_template = GradingTemplate.objects.filter(name__contains="النظرية").first()
practical_template = GradingTemplate.objects.filter(name__contains="العملية").first()
lab_template = GradingTemplate.objects.filter(name__contains="المعامل").first()
design_template = GradingTemplate.objects.filter(name__contains="التصميم").first()
elective_template = GradingTemplate.objects.filter(name__contains="الاختيارية").first()

assigned_count = 0
for subject in subjects:
    template = None
    
    # Elective courses get elective template
    if subject.is_elective and elective_template:
        template = elective_template
    # Subjects with high lab hours get lab template
    elif subject.lab_hours >= 2 and lab_template:
        template = lab_template
    # Subjects with some lab hours get practical template
    elif subject.lab_hours > 0 and practical_template:
        template = practical_template
    # Design/project subjects (Architecture and similar)
    elif 'تصميم' in subject.name or 'مشروع' in subject.name:
        template = design_template
    # Default to theoretical template
    elif theoretical_template:
        template = theoretical_template
    
    if template:
        subject.default_grading_template = template
        subject.save()
        assigned_count += 1
        
print(f"\n✓ Assigned templates to {assigned_count} subjects")

print("\n" + "=" * 60)
print("Seeding Complete!")
print(f"Templates: {GradingTemplate.objects.count()}")
print(f"Subjects with templates: {Subject.objects.exclude(default_grading_template__isnull=True).count()}")
print("=" * 60)
