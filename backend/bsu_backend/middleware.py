from django.utils.cache import patch_vary_headers, patch_cache_control

class VaryCookieMiddleware:
    """
    Middleware to ensure API responses include 'Vary: Cookie' and
    'Cache-Control: no-store' headers. This prevents browsers, CDNs,
    and intermediaries from serving cached responses from one user to another.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith('/api/'):
            patch_vary_headers(response, ['Cookie'])
            patch_cache_control(response, no_store=True, no_cache=True, must_revalidate=True)
            response['Pragma'] = 'no-cache'
        return response
