"""
Custom authentication classes
"""
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that exempts CSRF enforcement.

    SECURITY RATIONALE:
    This project uses a cross-origin SPA architecture (React frontend on a different
    origin than the Django backend). The session cookies are configured with:
      - SameSite=None (required for cross-origin cookie sending)
      - Secure=True (required when SameSite=None)
      - CORS_ALLOW_CREDENTIALS=True

    In this setup, Django's default CSRF protection via double-submit cookie pattern
    does not work reliably because the browser won't include CSRF cookies in
    cross-origin requests. The session itself serves as the authentication mechanism,
    and CORS policy restricts which origins can make credentialed requests.

    If the frontend and backend are consolidated to the same origin, this class
    should be replaced with the default SessionAuthentication to re-enable CSRF.
    """
    def enforce_csrf(self, request):
        return
