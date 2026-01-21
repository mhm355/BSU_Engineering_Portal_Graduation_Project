
import os
import django
import sys
import traceback

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from academic.models import Student, Level, AcademicYear, Department
from django.db import transaction

User = get_user_model()

def run_test():
    print("Starting deletion test...")
    
    # 1. Create a dummy user
    username = "test_delete_user"
    try:
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': 'test_delete@example.com',
                    'role': 'STUDENT_AFFAIRS',
                    'national_id': '99999999999999'
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                print(f"Created test user: {user.username} (ID: {user.id})")
            else:
                print(f"Using existing test user: {user.username} (ID: {user.id})")

            # 2. Try to delete the user
            print(f"Attempting to delete user {user.id}...")
            user.delete()
            print("Deletion successful!")
            
    except Exception as e:
        print("\n!!! DELETION FAILED !!!")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()

if __name__ == '__main__':
    run_test()
