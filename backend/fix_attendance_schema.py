import os
import django
from django.db import connection

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

def fix_attendance_table():
    print("Attempting to drop incompatible 'academic_attendance' table...")
    with connection.cursor() as cursor:
        # Check if table exists (optional, but good for safety)
        cursor.execute("DROP TABLE IF EXISTS academic_attendance")
        print("✅ Table 'academic_attendance' dropped successfully.")
        
    print("\nAttempting to drop 'django_admin_log' (to fix previous sync issue if needed)...")
    with connection.cursor() as cursor:
        cursor.execute("DROP TABLE IF EXISTS django_admin_log")
        print("✅ Table 'django_admin_log' dropped successfully.")

if __name__ == "__main__":
    fix_attendance_table()
