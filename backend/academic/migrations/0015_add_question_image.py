# Generated migration to add question_image field to QuizQuestion

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('academic', '0014_attendance_date_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='quizquestion',
            name='question_text',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='quizquestion',
            name='question_image',
            field=models.ImageField(blank=True, null=True, upload_to='quiz_questions/'),
        ),
    ]
