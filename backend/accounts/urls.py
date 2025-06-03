from django.urls import path
from .views import AccountListCreateView, AccountDetailView, AccountTypeListView, CurrencyListView
from . import views

urlpatterns = [
    path('', AccountListCreateView.as_view(), name='account-list-create'),
    path('<int:pk>/', AccountDetailView.as_view(), name='account-detail'),
    path('types/', AccountTypeListView.as_view(), name='account-types'),
    path('currencies/', CurrencyListView.as_view(), name='currencies'),
    # Admin endpoints
    path('admin/users/', views.AdminUserListCreateView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/accounts/', views.AdminAccountListView.as_view(), name='admin-accounts'),
    path('admin/accounts/<int:pk>/', views.AdminAccountDetailView.as_view(), name='admin-account-detail'),
]
