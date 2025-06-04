from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings

class CookieJWTAuthentication(JWTAuthentication):
    def get_raw_token(self, request):
        raw_token = request.COOKIES.get('access_token')
        if raw_token:
            return raw_token
        
        return super().get_raw_token(request)
