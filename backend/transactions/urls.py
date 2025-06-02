from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'', TransactionViewSet, basename='transaction')

# The API URLs are now determined automatically by the router
urlpatterns = [
    # Important: Place the custom action before the router.urls inclusion
    path('by_account/', TransactionViewSet.as_view({'get': 'by_account'}), name='transaction-by-account'),
    path('', include(router.urls)),
]
