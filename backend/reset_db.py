import os
import django
import subprocess
import sys
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

def run_command(command):
    print(f"\n> Running: {command}")
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        print(f"Error running command: {command}")
        sys.exit(1)

def main():
    print("="*60)
    print("BSU Engineering Portal - COMPLETE DATABASE RESET")
    print("="*60)
    
    confirm = input("WARNING: This will DELETE ALL DATA in the database. Are you sure? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Operation cancelled.")
        return

    # 1. Flush Database
    print("\n[1/6] Flushing database...")
    run_command("python manage.py flush --no-input")

    # 2. Run Migrations (just to be safe)
    print("\n[2/6] Running migrations...")
    run_command("python manage.py migrate")

    # 3. Create Superuser (Admin) & Basic Users
    print("\n[3/6] creating users...")
    # First create default media assets
    run_command("python seed_defaults.py")
    run_command("python seed_users.py")

    # 4. Create Production Data (Departments, Specs, Templates)
    print("\n[4/6] Seeding production data...")
    run_command("python seed_production.py")

    # 5. Create Subjects (This requires Departments/Templates)
    print("\n[5/6] Seeding subjects...")
    run_command("python seed_subjects.py")
    
    # 6. Create Academic Data (Years, Terms, Levels)
    print("\n[6/6] Seeding academic structure (Years, Levels)...")
    run_command("python seed_structure.py")

    print("\n" + "="*60)
    print("DATABASE RESET COMPLETE!")
    print("="*60)
    print("You can now login with:")
    print("  Admin: admin / password")
    print("  Student: student / password")
    print("  Doctor: doctor / password")
    print("  Staff: staff / password")

if __name__ == '__main__':
    main()
