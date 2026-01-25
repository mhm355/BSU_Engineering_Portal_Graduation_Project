from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0023_recreate_attendance_table'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentgrade',
            name='attendance',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='studentgrade',
            name='quizzes',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
    ]
