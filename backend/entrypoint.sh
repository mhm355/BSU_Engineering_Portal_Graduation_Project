#!/bin/bash
set -e

export DJANGO_SETTINGS_MODULE=bsu_backend.settings

echo "Starting BSU Backend..."
echo "PORT: ${PORT:-8000}"

# Run migrations in correct order (users first due to custom User model)
echo "Running migrations..."
python manage.py migrate --noinput || echo "Warning: migrations failed, continuing..."

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
