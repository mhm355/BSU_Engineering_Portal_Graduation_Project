from django.core.management.base import BaseCommand
from django.contrib.auth import authenticate
from users.models import User

class Command(BaseCommand):
    help = 'Test login for a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)
        parser.add_argument('password', type=str)

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        
        print(f"🔍 Testing Login for user: {username}")
        
        try:
            # 1. Check if user exists
            user = User.objects.filter(username=username).first()
            if not user:
                 print("❌ User NOT FOUND in database!")
                 return

            print(f"✅ User found: ID={user.id}, Role={user.role}, Active={user.is_active}")
            print(f"   Stored Password Hash: {user.password[:20]}...")

            # 2. Try authenticate
            auth_user = authenticate(username=username, password=password)
            if auth_user:
                print("✅ Authentication SUCCESSFUL!")
                print(f"   Returned User: {auth_user}")
            else:
                print("❌ Authentication FAILED (Invalid Password?)")
                
                # Debug password check manually
                is_correct = user.check_password(password)
                print(f"   Manual check_password(): {is_correct}")
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
