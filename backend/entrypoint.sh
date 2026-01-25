#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database..."
max_retries=30
retry_count=0
while ! python -c "import MySQLdb; MySQLdb.connect(host='db', user='bsu_user', password='bsu_password', database='bsu_db')" 2>/dev/null; do
    echo "Database not ready, waiting... ($retry_count/$max_retries)"
    sleep 2
    retry_count=$((retry_count + 1))
    if [ $retry_count -ge $max_retries ]; then
        echo "Database connection timeout!"
        exit 1
    fi
done
echo "Database is ready!"

# Run all migrations at once
echo "Running migrations..."
python manage.py migrate --noinput || true

echo "Migrations completed!"

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

# Run default media seed script
echo "Running default media seed..."
if [ -f "seed_defaults.py" ]; then
    python seed_defaults.py || echo "Warning: seed_defaults.py failed"
else
    echo "Warning: seed_defaults.py not found, skipping."
fi

# Run production seed script (Departments, Specializations, Grading Templates)
echo "Running production seed..."
if [ -f "seed_production.py" ]; then
    python seed_production.py || echo "Warning: seed_production.py failed"
else
    echo "Warning: seed_production.py not found, skipping."
fi

# Run academic structure seed script (Years, Terms, Levels)
echo "Running academic structure seed..."
if [ -f "seed_structure.py" ]; then
    python seed_structure.py || echo "Warning: seed_structure.py failed"
else
    echo "Warning: seed_structure.py not found, skipping."
fi

# Run users seed script (Standard Users)
echo "Running users seed..."
if [ -f "seed_users.py" ]; then
    python seed_users.py || echo "Warning: seed_users.py failed"
else
    echo "Warning: seed_users.py not found, skipping."
fi

# Run subjects seed script
echo "Running subjects seed..."
if [ -f "seed_subjects.py" ]; then
    python seed_subjects.py || echo "Warning: seed_subjects.py failed"
else
    echo "Warning: seed_subjects.py not found, skipping."
fi

# Start the server
echo "Starting server..."
if [ -f "fix_attendance_final.py" ]; then
    echo "Running FINAL database fix script..."
    python fix_attendance_final.py
fi
exec python manage.py runserver 0.0.0.0:8000
