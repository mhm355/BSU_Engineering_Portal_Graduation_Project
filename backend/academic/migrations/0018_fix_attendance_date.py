from django.db import migrations, models
from django.db import connection

def fix_attendance_date(apps, schema_editor):
    with connection.cursor() as cursor:
        # Check if table exists
        cursor.execute("SHOW TABLES LIKE 'academic_attendance'")
        if not cursor.fetchone():
            return # Should not happen if previous migrations ran, or handled by 0014

        # Check if date column exists
        cursor.execute("SHOW COLUMNS FROM academic_attendance LIKE 'date'")
        if not cursor.fetchone():
            print("Adding missing 'date' column to academic_attendance")
            # Create column with temporary default to handle existing rows
            cursor.execute("ALTER TABLE academic_attendance ADD COLUMN date DATE NOT NULL DEFAULT '2024-01-01'")
            # Remove the default value
            cursor.execute("ALTER TABLE academic_attendance ALTER COLUMN date DROP DEFAULT")
        else:
            print("'date' column already exists in academic_attendance")

class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0017_courseoffering_final_exam_date_and_more'),
    ]

    operations = [
        migrations.RunPython(fix_attendance_date),
    ]
