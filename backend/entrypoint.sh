#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! python -c "import MySQLdb; MySQLdb.connect(host='db', user='bsu_user', password='bsu_password', database='bsu_db')" 2>/dev/null; do
    echo "Database not ready, waiting..."
    sleep 2
done
echo "Database is ready!"

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist
echo "Checking for admin user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
admin, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@example.com',
        'is_superuser': True,
        'is_staff': True,
        'role': 'ADMIN'
    }
)
if created:
    admin.set_password('password123')
    admin.save()
    print('Admin user created!')
else:
    # Ensure existing admin has correct role
    if admin.role != 'ADMIN':
        admin.role = 'ADMIN'
        admin.save()
        print('Admin role updated!')
    else:
        print('Admin user already exists.')
"

# Run production seed script (idempotent - safe to run multiple times)
echo "Running production seed..."
if [ -f "seed_production.py" ]; then
    python seed_production.py
else
    echo "Warning: seed_production.py not found, skipping."
fi

# Run subjects seed script (idempotent - safe to run multiple times)
echo "Running subjects seed..."
if [ -f "seed_subjects.py" ]; then
    python seed_subjects.py
else
    echo "Warning: seed_subjects.py not found, skipping."
fi

# Start the server
echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000
