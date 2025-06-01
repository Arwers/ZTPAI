from django.urls import path
from .views import AccountListCreateView, AccountDetailView, AccountTypeListView, CurrencyListView

urlpatterns = [
    # User-specific account endpoints
    path('', AccountListCreateView.as_view(), name='account-list-create'),
    path('<int:pk>/', AccountDetailView.as_view(), name='account-detail'),
    
    # Public reference data endpoints
    path('types/', AccountTypeListView.as_view(), name='account-type-list'),
    path('currencies/', CurrencyListView.as_view(), name='currency-list'),
]
