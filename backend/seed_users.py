import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def create_user(username, password, role, first_name, last_name):
    if not User.objects.filter(username=username).exists():
        User.objects.create_user(
            username=username,
            password=password,
            role=role,
            first_name=first_name,
            last_name=last_name
        )
        print(f"Created {role} user: {username}")
    else:
        print(f"User {username} already exists")

create_user('admin', 'password', 'ADMIN', 'Admin', 'User')
create_user('student', 'password', 'STUDENT', 'Ahmed', 'Student')
create_user('doctor', 'password', 'DOCTOR', 'Mohamed', 'Doctor')
create_user('staff', 'password', 'STAFF', 'Sayed', 'Staff')
