from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Account, AccountType, Currency
from .serializers import AccountSerializer, AccountTypeSerializer, CurrencySerializer
from .authentication import CookieJWTAuthentication

class AccountListCreateView(generics.ListCreateAPIView):
    """
    List all accounts for the authenticated user or create a new account.
    """
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get_queryset(self):
        # Filter accounts by the authenticated user
        return Account.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Check if user has reached account limit
        user_account_count = Account.objects.filter(user=self.request.user).count()
        if user_account_count >= 4:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(detail="You have reached the maximum limit of 4 accounts.")
            
        # Set the user to the authenticated user
        serializer.save(user=self.request.user)

class AccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an account instance for the authenticated user.
    """
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get_queryset(self):
        # Filter accounts by the authenticated user
        return Account.objects.filter(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Account successfully deleted"}, status=status.HTTP_200_OK)

class AccountTypeListView(generics.ListAPIView):
    """
    List all account types available in the system.
    """
    queryset = AccountType.objects.all()
    serializer_class = AccountTypeSerializer
    permission_classes = [permissions.AllowAny]

class CurrencyListView(generics.ListAPIView):
    """
    List all currencies available in the system.
    """
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [permissions.AllowAny]
