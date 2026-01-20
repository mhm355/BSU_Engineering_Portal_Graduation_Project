# Migration to CREATE Attendance model (was deleted in 0008)

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0013_courseoffering_specialization'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attendance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('status', models.CharField(choices=[('PRESENT', 'حاضر'), ('ABSENT', 'غائب')], default='ABSENT', max_length=10)),
                ('recorded_at', models.DateTimeField(auto_now=True)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance_records', to='academic.student')),
                ('course_offering', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance_records', to='academic.courseoffering')),
            ],
            options={
                'unique_together': {('student', 'course_offering', 'date')},
            },
        ),
    ]
