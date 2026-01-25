"""
Custom authentication classes
"""
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that doesn't enforce CSRF.
    Use this for API endpoints that are called from React frontend
    since the frontend handles auth via session cookies.
    """
    def enforce_csrf(self, request):
        # Don't perform CSRF check
        return
