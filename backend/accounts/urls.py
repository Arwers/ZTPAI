from django.urls import path
from .views import AccountListCreateView, AccountDetailView, AccountTypeListView, CurrencyListView

urlpatterns = [
    path('', AccountListCreateView.as_view(), name='account-list-create'),
    path('<int:pk>/', AccountDetailView.as_view(), name='account-detail'),
    path('types/', AccountTypeListView.as_view(), name='account-type-list'),
    path('currencies/', CurrencyListView.as_view(), name='currency-list'),
]
