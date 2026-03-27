# Migration to handle Attendance model - safe to run multiple times
# Uses RunSQL with IF NOT EXISTS to handle cases where table already exists

from django.db import migrations, models
import django.db.models.deletion


def check_and_create_attendance(apps, schema_editor):
    """Create Attendance table only if it doesn't exist"""
    from django.db import connection
    cursor = connection.cursor()
    cursor.execute("SHOW TABLES LIKE 'academic_attendance'")
    if not cursor.fetchone():
        # Table doesn't exist, create it
        cursor.execute("""
            CREATE TABLE `academic_attendance` (
                `id` bigint AUTO_INCREMENT NOT NULL PRIMARY KEY,
                `date` date NOT NULL,
                `status` varchar(10) NOT NULL,
                `recorded_at` datetime(6) NOT NULL,
                `course_offering_id` bigint NOT NULL,
                `student_id` bigint NOT NULL,
                UNIQUE KEY `academic_attendance_unique` (`student_id`, `course_offering_id`, `date`),
                CONSTRAINT `academic_attendance_course_offering_fk` 
                    FOREIGN KEY (`course_offering_id`) REFERENCES `academic_courseoffering` (`id`) ON DELETE CASCADE,
                CONSTRAINT `academic_attendance_student_fk` 
                    FOREIGN KEY (`student_id`) REFERENCES `academic_student` (`id`) ON DELETE CASCADE
            )
        """)
        print("Created academic_attendance table")
    else:
        print("academic_attendance table already exists, skipping")


def reverse_migration(apps, schema_editor):
    """Do nothing on reverse - keep the table"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0013_courseoffering_specialization'),
    ]

    operations = [
        migrations.RunPython(check_and_create_attendance, reverse_migration),
    ]
