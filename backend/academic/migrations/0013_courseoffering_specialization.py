# Generated migration to add specialization field to CourseOffering

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0012_add_grading_template_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='courseoffering',
            name='specialization',
            field=models.ForeignKey(
                blank=True,
                help_text='Specialization for Electrical dept level 2+. Null for other depts/levels.',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='course_offerings',
                to='academic.specialization'
            ),
        ),
    ]
