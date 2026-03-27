from django.db import migrations, models
from django.db import connection

def emergency_drop(apps, schema_editor):
    with connection.cursor() as cursor:
        # The exact index name reported by the user error
        target_index = 'academic_attendance_student_id_course_offeri_c422e8f2_uniq'
        
        print(f"Attempting to drop problematic index: {target_index}")
        try:
            # Check if it exists before dropping to avoid error if already gone
            cursor.execute(f"SHOW INDEX FROM academic_attendance WHERE Key_name = '{target_index}'")
            if cursor.fetchone():
                cursor.execute(f"DROP INDEX {target_index} ON academic_attendance")
                print("Successfully dropped index.")
            else:
                print("Index not found (already dropped?)")
                
        except Exception as e:
            print(f"Error dropping index: {e}")

        # Also try to clean up duplicates AGAIN just in case
        print("Ensuring no duplicates exist before creating new index...")
        cursor.execute("""
            DELETE t1 FROM academic_attendance t1
            INNER JOIN academic_attendance t2 
            WHERE 
                t1.id < t2.id AND 
                t1.student_id = t2.student_id AND 
                t1.course_offering_id = t2.course_offering_id AND 
                t1.date = t2.date
        """)

class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0021_force_cleanup_constraints'),
    ]

    operations = [
        migrations.RunPython(emergency_drop),
    ]
