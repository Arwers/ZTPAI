from rest_framework.routers import DefaultRouter

from .viewset_collection.user_view import UserViewSet
from .viewset_collection.credentials_view import CredentialsViewSet
router = DefaultRouter()

router.register(r'user', UserViewSet, basename='user')
router.register(r'credentials', CredentialsViewSet, basename='credentials')

