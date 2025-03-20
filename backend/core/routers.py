from rest_framework.routers import DefaultRouter

from .viewset_collection.user_view import UsersViewSet
from .viewset_collection.credentials_view import CredentialsViewSet
from .viewset_collection.expenses_view import ExpensesViewSet
router = DefaultRouter()

router.register(r'users', UsersViewSet, basename='users')
router.register(r'credentials', CredentialsViewSet, basename='credentials')
router.register(r'expenses', ExpensesViewSet, basename='expenses')


