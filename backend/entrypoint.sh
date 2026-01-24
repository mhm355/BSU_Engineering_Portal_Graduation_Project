#!/bin/bash
set -e

# Wait for database with flexible host detection
echo "Waiting for database..."

# Use Django's database configuration for connection check
export DJANGO_SETTINGS_MODULE=bsu_backend.settings

max_retries=30
retry_count=0
while ! python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsu_backend.settings')
import django
django.setup()
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT 1')
print('Database connected!')
" 2>/dev/null; do
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

# Collect static files for production
echo "Collecting static files..."
python manage.py collectstatic --noinput || true

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
    python seed_production.py || echo "Warning: seed_production.py failed"
else
    echo "Warning: seed_production.py not found, skipping."
fi

# Run subjects seed script (idempotent - safe to run multiple times)
echo "Running subjects seed..."
if [ -f "seed_subjects.py" ]; then
    python seed_subjects.py || echo "Warning: seed_subjects.py failed"
else
    echo "Warning: seed_subjects.py not found, skipping."
fi

# Start the server - use gunicorn for production, runserver for development
echo "Starting server..."
if [ ! -z "$RAILWAY_ENVIRONMENT" ] || [ ! -z "$DATABASE_URL" ]; then
    # Production mode (Railway)
    exec gunicorn bsu_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
else
    # Development mode
    exec python manage.py runserver 0.0.0.0:8000
fi
