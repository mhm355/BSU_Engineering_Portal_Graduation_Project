# Generated manually to fix attendance table schema issues
# Fixes missing default value for session_number field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0017_courseoffering_final_exam_date_and_more'),
    ]

    operations = [
        # Ensure session_number has a default value (fixing production database issue)
        migrations.AlterField(
            model_name='attendance',
            name='session_number',
            field=models.IntegerField(default=1),
        ),
    ]
