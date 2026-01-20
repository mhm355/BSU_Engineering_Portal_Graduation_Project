import os
import django
from django.db import connection

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

def clean_for_migration_0016():
    print("Cleaning up conflicts for Migration 0016...")
    with connection.cursor() as cursor:
        # 1. Drop LectureSchedule table if exists (Migration 0016 creates it)
        cursor.execute("DROP TABLE IF EXISTS academic_lectureschedule")
        print("✅ Dropped table 'academic_lectureschedule'")

        # 2. Drop 'status' column from StudentQuizAttempt (Migration 0016 adds it)
        try:
            cursor.execute("ALTER TABLE academic_studentquizattempt DROP COLUMN status")
            print("✅ Dropped column 'status' from 'academic_studentquizattempt'")
        except Exception as e:
            print(f"ℹ️ Note: {e}")
            
    print("Cleanup complete. Migration 0016 should now run cleanly.")

if __name__ == "__main__":
    clean_for_migration_0016()
