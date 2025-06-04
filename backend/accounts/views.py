from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Account, AccountType, Currency
from .serializers import AccountSerializer, AccountTypeSerializer, CurrencySerializer
from .authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .serializers import UserSerializer

User = get_user_model()

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

class AdminUserListCreateView(generics.ListCreateAPIView):
    """
    Admin view to list all users and create new users
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [CookieJWTAuthentication]

    def perform_create(self, serializer):
        # Hash the password before saving
        password = serializer.validated_data.get('password')
        if password:
            serializer.validated_data['password'] = make_password(password)
        serializer.save()

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin view to retrieve, update, or delete a specific user
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [CookieJWTAuthentication]

class AdminAccountListView(generics.ListAPIView):
    """
    Admin view to list all accounts across all users
    """
    serializer_class = AccountSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [CookieJWTAuthentication]

    def get_queryset(self):
        try:
            # Use simple ordering by id instead of created_at
            return Account.objects.all().select_related('user', 'currency', 'account_type').order_by('id')
        except Exception as e:
            # Fallback without select_related if there are issues
            return Account.objects.all().order_by('id')

class AdminAccountDetailView(generics.RetrieveDestroyAPIView):
    """
    Admin view to retrieve or delete a specific account
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [CookieJWTAuthentication]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Account successfully deleted"}, status=status.HTTP_200_OK)
