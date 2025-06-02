from django.contrib import admin
from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'account', 'category', 'amount', 'transaction_date', 'frequency')
    list_filter = ('account', 'category', 'frequency')
    search_fields = ('description', 'account__name', 'category__name')
    date_hierarchy = 'transaction_date'
    ordering = ('-transaction_date',)
