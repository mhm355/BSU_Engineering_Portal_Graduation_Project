from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0022_emergency_index_drop'),
    ]

    operations = [
        # This migration previously attempted risky table recreation.
        # We now rely on 'fix_attendance_final.py' startup script.
        # This checks ensures we pass the migration history check without crashing.
    ]
