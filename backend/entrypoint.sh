#!/bin/bash
set -e

export DJANGO_SETTINGS_MODULE=bsu_backend.settings

echo "Starting BSU Backend..."
echo "PORT: ${PORT:-8000}"

# Wait for Redis to be available
echo "Checking Redis connection..."
python -c "
import socket
import time
import os
redis_host = os.environ.get('REDIS_HOST', 'redis')
redis_port = int(os.environ.get('REDIS_PORT', 6379))
max_retries = 30
retry_delay = 1
for i in range(max_retries):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((redis_host, redis_port))
        sock.close()
        if result == 0:
            print(f'Redis is available at {redis_host}:{redis_port}')
            break
        else:
            print(f'Redis connection attempt {i+1}/{max_retries} failed, retrying...')
            time.sleep(retry_delay)
    except Exception as e:
        print(f'Redis check error: {e}, retrying...')
        time.sleep(retry_delay)
else:
    print('WARNING: Could not connect to Redis. Sessions will fall back to database.')
"

# Run migrations in correct order (users first due to custom User model)
echo "Running migrations..."
python manage.py migrate --noinput || { echo "ERROR: migrations failed, aborting startup"; exit 1; }

echo "Migrations completed!"

# Collect static files for production
echo "Collecting static files..."
python manage.py collectstatic --noinput || true

# Create superuser if it doesn't exist
echo "Checking for admin user..."
python manage.py shell -c "
import os
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
    admin_password = os.environ.get('ADMIN_PASSWORD', 'password123')
    admin.set_password(admin_password)
    admin.first_login_required = True
    admin.save()
    if admin_password == 'password123':
        print('WARNING: Admin created with default password. Set ADMIN_PASSWORD env var for production!')
    else:
        print('Admin user created with secure password.')
else:
    print('Admin user already exists.')
" || echo "Warning: admin user creation failed"

# Run seed scripts
echo "Running production seed..."
if [ -f "seed_production.py" ]; then
    python seed_production.py || echo "Warning: seed_production.py failed"
fi

echo "Running subjects seed..."
if [ -f "seed_subjects.py" ]; then
    python seed_subjects.py || echo "Warning: seed_subjects.py failed"
fi

# Start the server
echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn bsu_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120 --access-logfile - --error-logfile -
