from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions
from django.conf import settings
from drf_spectacular.extensions import OpenApiAuthenticationExtension

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom authentication class that authenticates using cookies instead of Authorization header.
    """
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        
        # Also check header for compatibility with API tools
        header = request.META.get('HTTP_AUTHORIZATION')
        
        if header:
            # Use standard JWT authentication if Authorization header exists
            return super().authenticate(request)
        
        if not access_token:
            return None
            
        # Get validated token
        validated_token = self.get_validated_token(access_token)
        
        # Return the user and the validated token
        return self.get_user(validated_token), validated_token

class CookieJWTScheme(OpenApiAuthenticationExtension):
    """
    Schema extension for the CookieJWTAuthentication class.
    """
    target_class = 'accounts.authentication.CookieJWTAuthentication'
    # Change the name to avoid conflict with SessionAuthentication
    name = 'jwtCookieAuth'
    
    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'cookie',
            'name': 'access_token',
            'description': 'JWT Token in cookie'
        }
