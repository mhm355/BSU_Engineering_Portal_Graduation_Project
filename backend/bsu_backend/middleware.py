from django.utils.cache import patch_vary_headers

class VaryCookieMiddleware:
    """
    Middleware to ensure API responses include the 'Vary: Cookie' header.
    This prevents browsers and CDN from serving cached responses belonging
    to one user to another user when multiple accounts log in from the same browser.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith('/api/'):
            patch_vary_headers(response, ['Cookie'])
        return response
