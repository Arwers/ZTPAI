from rest_framework import serializers
from .models import Account, AccountType, Currency
from django.contrib.auth import get_user_model

User = get_user_model()

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol']

class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer without password for account listings"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class AccountSerializer(serializers.ModelSerializer):
    currency = CurrencySerializer(read_only=True)
    account_type = AccountTypeSerializer(read_only=True)
    user = UserBasicSerializer(read_only=True)
    currency_id = serializers.IntegerField(write_only=True, required=False)
    account_type_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Account
        fields = ['id', 'name', 'balance', 'currency', 'account_type', 'user', 'currency_id', 'account_type_id']
        read_only_fields = ['user']
