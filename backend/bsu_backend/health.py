"""
Health check endpoint for container monitoring.
Returns DB connectivity status for Docker healthchecks.
"""
from django.http import JsonResponse
from django.db import connection


def health_check(request):
    """Simple health check endpoint.
    GET /api/health/ → {"status": "ok", "db": "connected"}
    Used by Docker healthcheck and load balancers.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    status_code = 200 if db_status == "connected" else 503
    return JsonResponse(
        {"status": "ok" if db_status == "connected" else "unhealthy", "db": db_status},
        status=status_code,
    )
