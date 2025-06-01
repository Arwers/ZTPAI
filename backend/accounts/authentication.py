from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
from users.models import User
import jwt

class CookieJWTAuthentication(BaseAuthentication):
    """
    Authentication class that gets JWT token from cookies.
    """
    def authenticate(self, request):
        # Get token from cookie
        access_token = request.COOKIES.get('access_token')
        
        # If no token in cookie, check Authorization header
        if not access_token:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                access_token = auth_header.split(' ')[1]
        
        if not access_token:
            return None
            
        try:
            # Decode token
            decoded_token = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
            
            if not user_id:
                return None
                
            # Get user by ID
            user = User.objects.filter(id=user_id).first()
            if not user:
                return None
                
            return (user, None)
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
