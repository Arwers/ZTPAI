from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from accounts.models import Account, AccountType, Currency
from categories.models import Category
from .models import Transaction

User = get_user_model()

class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.currency = Currency.objects.create(
            code='USD',
            name='US Dollar',
            symbol='$'
        )
        self.account_type = AccountType.objects.create(
            name='Checking'
        )
        self.account = Account.objects.create(
            user=self.user,
            name='Test Account',
            balance=Decimal('1000.00'),
            currency=self.currency,
            account_type=self.account_type
        )
        self.category = Category.objects.create(
            name='Groceries',
            description='Food expenses',
            is_income=False
        )

    def test_transaction_creation(self):
        transaction = Transaction.objects.create(
            account=self.account,
            category=self.category,
            amount=Decimal('-50.00'),
            description='Grocery shopping',
            transaction_date=timezone.now()
        )
        self.assertEqual(transaction.amount, Decimal('-50.00'))
        self.assertEqual(transaction.description, 'Grocery shopping')
        self.assertEqual(transaction.account, self.account)

    def test_transaction_str(self):
        transaction = Transaction.objects.create(
            account=self.account,
            category=self.category,
            amount=Decimal('-50.00'),
            description='Grocery shopping',
            transaction_date=timezone.now()
        )
        # Update to match actual string representation
        expected_str = f"Groceries: -50.00 (Test Account)"
        self.assertEqual(str(transaction), expected_str)

    def test_recurring_transaction(self):
        transaction = Transaction.objects.create(
            account=self.account,
            category=self.category,
            amount=Decimal('-100.00'),
            description='Monthly rent',
            transaction_date=timezone.now(),
            frequency='monthly',
            next_due_date=(timezone.now() + timedelta(days=30)).date()
        )
        self.assertEqual(transaction.frequency, 'monthly')
        self.assertIsNotNone(transaction.next_due_date)

class TransactionAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='otherpass123'
        )
        self.currency = Currency.objects.create(
            code='USD',
            name='US Dollar',
            symbol='$'
        )
        self.account_type = AccountType.objects.create(
            name='Checking'
        )
        self.account = Account.objects.create(
            user=self.user,
            name='Test Account',
            balance=Decimal('1000.00'),
            currency=self.currency,
            account_type=self.account_type
        )
        self.other_account = Account.objects.create(
            user=self.other_user,
            name='Other Account',
            balance=Decimal('500.00'),
            currency=self.currency,
            account_type=self.account_type
        )
        self.category = Category.objects.create(
            name='Groceries',
            description='Food expenses',
            is_income=False
        )

    def get_user_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_create_transaction(self):
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Use direct URL path instead of reverse
        url = '/api/transactions/'
        data = {
            'account': self.account.id,
            'category': self.category.id,
            'amount': '-25.50',
            'description': 'Coffee',
            'transaction_date': timezone.now().isoformat()
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Transaction.objects.count(), 1)

    def test_get_transactions_by_account(self):
        Transaction.objects.create(
            account=self.account,
            category=self.category,
            amount=Decimal('-50.00'),
            description='Grocery shopping',
            transaction_date=timezone.now()
        )
        
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Use direct URL path instead of reverse
        url = '/api/transactions/by_account/'
        response = self.client.get(url, {'account_id': self.account.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_cannot_access_other_user_transactions(self):
        Transaction.objects.create(
            account=self.other_account,
            category=self.category,
            amount=Decimal('-30.00'),
            description='Other user transaction',
            transaction_date=timezone.now()
        )
        
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Use direct URL path instead of reverse
        url = '/api/transactions/by_account/'
        response = self.client.get(url, {'account_id': self.other_account.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_delete_transaction(self):
        transaction = Transaction.objects.create(
            account=self.account,
            category=self.category,
            amount=Decimal('-25.00'),
            description='Test transaction',
            transaction_date=timezone.now()
        )
        
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Use direct URL path instead of reverse
        url = f'/api/transactions/{transaction.id}/'
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Transaction.objects.count(), 0)

    def test_unauthorized_access(self):
        # Use direct URL path instead of reverse
        url = '/api/transactions/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
