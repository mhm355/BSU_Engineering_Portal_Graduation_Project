import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def force_reset_admin():
    print("="*50)
    print("EMERGENCY ADMIN RESET")
    print("="*50)
    
    try:
        if User.objects.filter(username='admin').exists():
            print("Found existing admin user. Deleting...")
            User.objects.get(username='admin').delete()
            print("Deleted.")
            
        print("Creating new admin user...")
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='password123',
            role='ADMIN'
        )
        print(f"Admin created successfully!")
        print(f"Username: {admin.username}")
        print(f"Role: {admin.role}")
        print("="*50)
        
    except Exception as e:
        print(f"Failed to reset admin: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    force_reset_admin()
