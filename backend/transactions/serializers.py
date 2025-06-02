from rest_framework import serializers
from .models import Transaction
from categories.models import Category


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    account_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'account', 'amount', 'transaction_date', 
            'description', 'category', 'category_name',  # Changed category_id to category
            'account_name', 'frequency', 'next_due_date'
        ]
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_account_name(self, obj):
        return obj.account.name if obj.account else None
