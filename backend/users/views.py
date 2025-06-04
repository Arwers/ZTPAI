from users.models import User
from rest_framework import generics
from users.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import jwt
from rest_framework.views import APIView
from accounts.authentication import CookieJWTAuthentication
from drf_spectacular.utils import extend_schema, OpenApiResponse

@extend_schema(
    summary="Create new user account",
    description="Register a new user with username, email and password",
    responses={
        201: UserSerializer,
        400: OpenApiResponse(description="Validation errors (username/email already exists, weak password)")
    }
)
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    authentication_classes = [CookieJWTAuthentication]

@extend_schema(
    summary="User login",
    description="Authenticate user and set JWT tokens in cookies",
    responses={
        200: OpenApiResponse(description="Login successful"),
        401: OpenApiResponse(description="Invalid credentials")
    }
)
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data['access']
            refresh_token = response.data['refresh']
            
            try:
                decoded_token = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
                user_id = decoded_token.get('user_id')
            except jwt.InvalidTokenError:
                user_id = None
            
            new_response = Response({
                'message': 'Login successful',
                'user_id': user_id
            })
            
            new_response.set_cookie(
                'access_token',
                access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            new_response.set_cookie(
                'refresh_token',
                refresh_token,
                max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds(),
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            
            return new_response
        return response

@extend_schema(
    summary="Refresh access token",
    description="Refresh JWT access token using refresh token from cookies",
    responses={
        200: OpenApiResponse(description="Token refreshed successfully"),
        401: OpenApiResponse(description="Invalid or expired refresh token")
    }
)
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            request.data['refresh'] = refresh_token
        
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            access_token = response.data['access']

            new_response = Response({'message': 'Token refreshed'})
            new_response.set_cookie(
                'access_token',
                access_token,
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
                httponly=True,
                secure=False,
                samesite='Lax'
            )
            
            return new_response
        return response

@extend_schema(
    summary="User logout",
    description="Clear JWT tokens from cookies",
    responses={200: OpenApiResponse(description="Logout successful")}
)
class LogoutView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        response = Response({'message': 'Logout successful'})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response

@extend_schema(
    summary="Get current user info",
    description="Retrieve authenticated user's profile information",
    responses={
        200: OpenApiResponse(description="User profile data"),
        401: OpenApiResponse(description="Authentication credentials not provided or invalid token"),
        404: OpenApiResponse(description="User not found")
    }
)
class MeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            decoded_token = jwt.decode(access_token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = decoded_token.get('user_id')
            user = User.objects.filter(id=user_id).first()
            if not user:
                return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({
                'username': user.username,
                'user_id': user.id,
                'is_staff': user.is_staff
            })
        except jwt.ExpiredSignatureError:
            return Response({'detail': 'Token has expired.'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_401_UNAUTHORIZED)

@extend_schema(
    summary="Manage user profile",
    description="Get or update authenticated user's profile",
    responses={
        200: UserSerializer,
        401: OpenApiResponse(description="Authentication required"),
        400: OpenApiResponse(description="Validation errors")
    }
)
class ManageUserView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        serializer.save()
