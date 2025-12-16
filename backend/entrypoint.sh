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
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'password123', role='ADMIN')
    print('Admin user created!')
else:
    print('Admin user already exists.')
"

# Start the server
echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000
