import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("-" * 30)
print("DIAGNOSIS REPORT")
print("-" * 30)

try:
    users = User.objects.filter(username='admin')
    if not users.exists():
        print("❌ Admin user NOT FOUND in database.")
        print("Listing all users:")
        for u in User.objects.all():
            print(f" - {u.username} ({u.role})")
    else:
        u = users.first()
        print(f"✅ User found: {u.username}")
        print(f"   Role: {u.role}")
        print(f"   Is Superuser: {u.is_superuser}")
        print(f"   Is Active: {u.is_active}")
        
        # Test password
        is_valid = u.check_password('password123')
        print(f"   Password 'password123' valid? {'✅ YES' if is_valid else '❌ NO'}")
        
        if not is_valid:
            print("   Resetting password manually now...")
            u.set_password('password123')
            u.save()
            print("   ✅ Password has been force-reset to 'password123'. Try logging in.")
            
except Exception as e:
    print(f"❌ Error during diagnosis: {e}")

print("-" * 30)
