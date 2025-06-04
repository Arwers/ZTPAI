from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

router = DefaultRouter()
router.register(r'', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('by_account/', TransactionViewSet.as_view({'get': 'by_account'}), name='transaction-by-account'),
    path('', include(router.urls)),
]
