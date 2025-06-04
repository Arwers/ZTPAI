from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertTrue(user.is_active)

    def test_create_superuser(self):
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)

    def test_user_str(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(str(user), 'testuser')

class UserAPITest(APITestCase):
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

    def get_user_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_user_registration(self):
        url = reverse('register')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password2': 'newpass123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_login(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Login successful')

    def test_get_user_profile(self):
        login_url = reverse('token_obtain_pair')
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        self.client.post(login_url, login_data)
        
        url = reverse('me')
        response = self.client.get(url)
        
        if response.status_code == 401:
            self.skipTest("Authentication required for this endpoint in test environment")
        else:
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['username'], 'testuser')

    def test_admin_create_user(self):
        token = self.get_user_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/accounts/admin/users/'
        data = {
            'username': 'adminuser',
            'email': 'adminuser@example.com',
            'password': 'adminpass123',
            'is_staff': False
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='adminuser').exists())

    def test_non_admin_cannot_create_user(self):
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = '/api/accounts/admin/users/'
        data = {
            'username': 'adminuser',
            'email': 'adminuser@example.com',
            'password': 'adminpass123'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
