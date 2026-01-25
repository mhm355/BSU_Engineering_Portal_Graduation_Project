from django.db import migrations, models
import datetime

class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0018_fix_attendance_date'),
    ]

    operations = [
        # 1. Remove session_number from DB and State
        migrations.RemoveField(
            model_name='attendance',
            name='session_number',
        ),
        
        # 2. Add date to State only (DB already has it from 0018)
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

        # 3. Update unique_together to match models.py
        migrations.AlterUniqueTogether(
            name='attendance',
            unique_together={('student', 'course_offering', 'date')},
        ),
    ]
