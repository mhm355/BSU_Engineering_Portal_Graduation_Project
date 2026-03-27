from django.db import migrations, models
from django.db import connection

def fix_constraints(apps, schema_editor):
    with connection.cursor() as cursor:
        # 1. Drop the broken index that only covers (student + course)
        # This index name comes from the user's error message: error 1062
        bad_indices = [
            'academic_attendance_student_id_course_offeri_c422e8f2_uniq',
            'attendance_unique_date' # Cleanup previous attempts if any
        ]
        
        for index in bad_indices:
            try:
                cursor.execute(f"DROP INDEX {index} ON academic_attendance")
                print(f"Dropped index {index}")
            except Exception as e:
                # Index might not exist, which is fine
                pass

        # 2. Remove Duplicate Records
        # Since we removed session_number, records that were unique by session are now duplicates by date
        # We keep the latest record (max id)
        print("Removing duplicate attendance records...")
        cursor.execute("""
            DELETE t1 FROM academic_attendance t1
            INNER JOIN academic_attendance t2 
            WHERE 
                t1.id < t2.id AND 
                t1.student_id = t2.student_id AND 
                t1.course_offering_id = t2.course_offering_id AND 
                t1.date = t2.date
        """)

        # 3. Add the correct Unique Constraint (student, course, date)
        print("Adding correct unique index...")
        try:
            cursor.execute("""
                CREATE UNIQUE INDEX attendance_unique_session 
                ON academic_attendance (student_id, course_offering_id, date)
            """)
        except Exception as e:
            print(f"Warning: Could not create unique index: {e}")

class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0019_sync_attendance_schema'),
    ]

    operations = [
        migrations.RunPython(fix_constraints),
    ]
