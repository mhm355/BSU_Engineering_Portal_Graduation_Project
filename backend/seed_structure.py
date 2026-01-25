import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from academic.models import Department, AcademicYear, Term, Level

def seed():
    print("=" * 60)
    print("Seeding Academic Structure (Years, Terms, Levels)")
    print("=" * 60)

    # 1. Create Academic Year
    year_name = "2025-2026"
    year, created = AcademicYear.objects.get_or_create(
        name=year_name,
        defaults={'is_current': True, 'status': AcademicYear.Status.OPEN}
    )
    if created:
        print(f"✓ Created Academic Year: {year.name}")
    else:
        print(f"• Exists: {year.name}")

    # 2. Create Terms
    terms = [Term.TermName.FIRST, Term.TermName.SECOND]
    for term_name in terms:
        term, created = Term.objects.get_or_create(
            name=term_name,
            academic_year=year
        )
        if created:
            print(f"✓ Created Term: {term.get_name_display()}")
    
    # 3. Create Levels for Each Department
    departments = Department.objects.all()
    
    LEVELS = [
        (Level.LevelName.PREPARATORY, 'PREP'),
        (Level.LevelName.FIRST, 'ALL'),
        (Level.LevelName.SECOND, 'ALL'),
        (Level.LevelName.THIRD, 'ALL'),
        (Level.LevelName.FOURTH, 'ALL'),
    ]

    for dept in departments:
        # Skip PREP department for regular levels, handled separately if needed
        if dept.code == 'PREP':
            # Create PREPARATORY level for PREP department
            level, created = Level.objects.get_or_create(
                name=Level.LevelName.PREPARATORY,
                department=dept,
                academic_year=year
            )
            if created:
                print(f"✓ Created Level: {level}")
            continue

        # For other departments
        for level_name, scope in LEVELS:
            if level_name == Level.LevelName.PREPARATORY:
                continue # Skip prep level for non-prep departments
            
            level, created = Level.objects.get_or_create(
                name=level_name,
                department=dept,
                academic_year=year
            )
            if created:
                print(f"✓ Created Level: {level}")

    print("\nAcademic Structure Seeding Complete!")

if __name__ == '__main__':
    seed()
