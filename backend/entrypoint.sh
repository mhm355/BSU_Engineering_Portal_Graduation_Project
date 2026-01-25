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

# Run super_fix.py for schema repair and admin reset
if [ -f "super_fix.py" ]; then
    echo "Running SUPER FIX (Schema + Admin)..."
    python super_fix.py
fi

# Run all migrations at once
echo "Running migrations..."
python manage.py migrate --noinput || echo "Warning: migrations failed, continuing..."

echo "Migrations completed!"

# Note: Admin reset and Schema repair are now handled by super_fix.py above

# Collect static files for production if requested
if [ "$PRODUCTION" = "1" ]; then
    echo "Collecting static files..."
    python manage.py collectstatic --noinput || true
fi

# Run default media seed script
echo "Running default media seed..."
if [ -f "seed_defaults.py" ]; then
    python seed_defaults.py || echo "Warning: seed_defaults.py failed"
fi

# Run production seed script (Departments, Specializations, Grading Templates)
echo "Running production seed..."
if [ -f "seed_production.py" ]; then
    python seed_production.py || echo "Warning: seed_production.py failed"
fi

# Run academic structure seed script (Years, Terms, Levels)
echo "Running academic structure seed..."
if [ -f "seed_structure.py" ]; then
    python seed_structure.py || echo "Warning: seed_structure.py failed"
fi

# Run users seed script (Standard Users)
echo "Running users seed..."
if [ -f "seed_users.py" ]; then
    python seed_users.py || echo "Warning: seed_users.py failed"
fi

# Run subjects seed script
echo "Running subjects seed..."
if [ -f "seed_subjects.py" ]; then
    python seed_subjects.py || echo "Warning: seed_subjects.py failed"
fi

# Start the server
echo "Starting final logic check..."
if [ -f "fix_attendance_final.py" ]; then
    echo "Running FINAL database fix script..."
    python fix_attendance_final.py
fi

# Use Gunicorn if in production mode, otherwise runserver
if [ "$PRODUCTION" = "1" ]; then
    echo "Starting gunicorn on port ${PORT:-8000}..."
    exec gunicorn bsu_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120 --access-logfile - --error-logfile -
else
    echo "Starting development server..."
    exec python manage.py runserver 0.0.0.0:8000
fi
