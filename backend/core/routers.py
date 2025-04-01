from rest_framework.routers import DefaultRouter

from .viewset_collection.user_view import RegisterViewSet, LoginViewSet
from .viewset_collection.expenses_view import ExpensesViewSet

router = DefaultRouter()

router.register(r"user", LoginViewSet, basename="login")
router.register(r"user", RegisterViewSet, basename="register")
router.register(r"expenses", ExpensesViewSet, basename="expenses")
