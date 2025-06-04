from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal
from .models import Account, AccountType, Currency

User = get_user_model()

class AccountModelTest(TestCase):
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

    def test_account_creation(self):
        account = Account.objects.create(
            user=self.user,
            name='Test Account',
            balance=Decimal('1000.00'),
            currency=self.currency,
            account_type=self.account_type
        )
        self.assertEqual(account.name, 'Test Account')
        self.assertEqual(account.balance, Decimal('1000.00'))
        self.assertEqual(str(account), 'Test Account (testuser)')

    def test_account_unique_together(self):
        Account.objects.create(
            user=self.user,
            name='Test Account',
            balance=Decimal('1000.00'),
            currency=self.currency,
            account_type=self.account_type
        )
        account2 = Account.objects.create(
            user=self.user,
            name='Test Account 2',
            balance=Decimal('2000.00'),
            currency=self.currency,
            account_type=self.account_type
        )
        self.assertEqual(Account.objects.count(), 2)

class CurrencyModelTest(TestCase):
    def test_currency_creation(self):
        currency = Currency.objects.create(
            code='EUR',
            name='Euro',
            symbol='€'
        )
        self.assertEqual(currency.code, 'EUR')
        self.assertEqual(str(currency), 'EUR')

class AccountTypeModelTest(TestCase):
    def test_account_type_creation(self):
        account_type = AccountType.objects.create(
            name='Savings'
        )
        self.assertEqual(account_type.name, 'Savings')
        self.assertEqual(str(account_type), 'Savings')

class AccountAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True
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

    def get_user_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_get_user_accounts(self):
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('account-list-create')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Account')

    def test_create_account(self):
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('account-list-create')
        data = {
            'name': 'New Account',
            'balance': '500.00',
            'currency_id': self.currency.id,
            'account_type_id': self.account_type.id
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Account.objects.count(), 2)

    def test_account_limit(self):
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        for i in range(3):
            Account.objects.create(
                user=self.user,
                name=f'Account {i+2}',
                balance=Decimal('1000.00'),
                currency=self.currency,
                account_type=self.account_type
            )
        
        url = reverse('account-list-create')
        data = {
            'name': 'Fifth Account',
            'balance': '500.00',
            'currency_id': self.currency.id,
            'account_type_id': self.account_type.id
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthorized_access(self):
        url = reverse('account-list-create')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
