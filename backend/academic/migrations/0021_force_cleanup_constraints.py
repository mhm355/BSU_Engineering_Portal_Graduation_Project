from django.db import migrations, models
from django.db import connection

def force_cleanup(apps, schema_editor):
    with connection.cursor() as cursor:
        # 1. Discover existing Unique Indexes
        cursor.execute("SHOW INDEX FROM academic_attendance")
        rows = cursor.fetchall()
        
        indices_to_drop = set()
        for row in rows:
            # row structure: Table, Non_unique, Key_name, Seq_in_index, Column_name...
            key_name = row[2]
            if key_name == 'PRIMARY':
                continue
            
            # Target any key with 'uniq' in name, or the specific problematic key reported
            if 'uniq' in key_name or 'c422e8f2' in key_name:
                indices_to_drop.add(key_name)
        
        # 2. Drop them
        for index in indices_to_drop:
            print(f"Dropping index: {index}")
            try:
                cursor.execute(f"DROP INDEX {index} ON academic_attendance")
            except Exception as e:
                print(f"Failed to drop {index}: {e}")

        # 3. Remove Duplicates (Crucial Step)
        # Keep the latest record for each (student, course, date) group
        print("Removing duplicates...")
        # MySQL Delete Join syntax
        cursor.execute("""
            DELETE t1 FROM academic_attendance t1
            INNER JOIN academic_attendance t2 
            WHERE 
                t1.id < t2.id AND 
                t1.student_id = t2.student_id AND 
                t1.course_offering_id = t2.course_offering_id AND 
                t1.date = t2.date
        """)

        # 4. Create the Correct Index
        print("Creating correct index...")
        try:
            cursor.execute("""
                CREATE UNIQUE INDEX attendance_unique_date_v2 
                ON academic_attendance (student_id, course_offering_id, date)
            """)
        except Exception as e:
            print(f"Warning: Could not create unique index: {e}")

class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0020_fix_attendance_constraints'),
    ]

    operations = [
        migrations.RunPython(force_cleanup),
    ]
