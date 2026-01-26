from django.db import migrations, models, connection
import datetime

def safe_remove_session_number(apps, schema_editor):
    """Remove session_number column only if it exists"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SHOW COLUMNS FROM academic_attendance LIKE 'session_number'")
            if cursor.fetchone():
                cursor.execute("ALTER TABLE academic_attendance DROP COLUMN session_number")
                print("Removed session_number column")
            else:
                print("session_number column does not exist, skipping")
    except Exception as e:
        print(f"Note: {e}")

def safe_fix_unique_constraint(apps, schema_editor):
    """Fix unique constraint - drop old if exists, create new"""
    try:
        with connection.cursor() as cursor:
            # Check if table exists
            cursor.execute("SHOW TABLES LIKE 'academic_attendance'")
            if not cursor.fetchone():
                print("academic_attendance table does not exist yet")
                return
            
            # Drop any old unique constraints that might conflict
            # Get all unique indexes
            cursor.execute("SHOW INDEX FROM academic_attendance WHERE Non_unique = 0")
            indexes = cursor.fetchall()
            
            for idx in indexes:
                idx_name = idx[2]  # Key_name is at index 2
                if idx_name != 'PRIMARY' and 'session_number' in str(idx):
                    try:
                        cursor.execute(f"DROP INDEX {idx_name} ON academic_attendance")
                        print(f"Dropped old index: {idx_name}")
                    except:
                        pass
                        
            print("Unique constraint check complete")
    except Exception as e:
        print(f"Note: {e}")

class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0018_fix_attendance_date'),
    ]

    operations = [
        # 1. Remove session_number from DB only if it exists
        migrations.RunPython(safe_remove_session_number, migrations.RunPython.noop),
        
        # 2. Fix unique constraints
        migrations.RunPython(safe_fix_unique_constraint, migrations.RunPython.noop),
        
        # 3. Add date to State only (DB already has it from 0018)
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='attendance',
                    name='date',
                    field=models.DateField(default=datetime.date(2024, 1, 1)),
                    preserve_default=False,
                ),
            ],
            database_operations=[],
        ),

        # 4. Update unique_together in state only - DB handled by RunPython above
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterUniqueTogether(
                    name='attendance',
                    unique_together={('student', 'course_offering', 'date')},
                ),
            ],
            database_operations=[],
        ),
    ]
