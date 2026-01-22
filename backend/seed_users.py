import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def create_user(username, password, role, first_name, last_name):
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_user(
            username=username,
            password=password,
            role=role,
            first_name=first_name,
            last_name=last_name
        )
        # Assign default avatar if exists
        # Note: We assign the relative path string directly. 
        # Django will expect this file to exist in MEDIA_ROOT/defaults/default_avatar.png
        # which is created by seed_defaults.py
        user.profile_picture.name = 'defaults/default_avatar.png'
        user.save()
        
        print(f"Created {role} user: {username} (with avatar)")
    else:
        print(f"User {username} already exists")

create_user('admin', 'password', 'ADMIN', 'Admin', 'User')
create_user('student', 'password', 'STUDENT', 'Ahmed', 'Student')
create_user('doctor', 'password', 'DOCTOR', 'Mohamed', 'Doctor')
create_user('staff', 'password', 'STAFF', 'Sayed', 'Staff')
