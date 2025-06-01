from rest_framework import serializers
from .models import Account, AccountType, Currency

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = ['id', 'code', 'name', 'symbol']

class AccountTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountType
        fields = ['id', 'name', 'description']

class AccountSerializer(serializers.ModelSerializer):
    currency = CurrencySerializer(read_only=True)
    account_type = AccountTypeSerializer(read_only=True)
    currency_id = serializers.IntegerField(write_only=True)
    account_type_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Account
        fields = ['id', 'name', 'balance', 'currency', 'account_type', 'currency_id', 'account_type_id', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        # Extract the ForeignKey IDs
        currency_id = validated_data.pop('currency_id', None)
        account_type_id = validated_data.pop('account_type_id', None)
        
        # Set the user from the request context
        validated_data['user'] = self.context['request'].user
        
        # Create the account instance
        account = Account(**validated_data)
        
        # Set the foreign keys
        if currency_id:
            account.currency_id = currency_id
        if account_type_id:
            account.account_type_id = account_type_id
            
        account.save()
        return account
