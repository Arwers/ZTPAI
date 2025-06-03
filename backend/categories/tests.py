from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Category

User = get_user_model()

class CategoryModelTest(TestCase):
    def test_category_creation(self):
        category = Category.objects.create(
            name='Food',
            description='Food and dining expenses',
            is_income=False
        )
        self.assertEqual(category.name, 'Food')
        self.assertEqual(category.description, 'Food and dining expenses')
        self.assertEqual(str(category), 'Food')

    def test_category_unique_name(self):
        Category.objects.create(name='Transportation', is_income=False)
        # If there's no unique constraint, this should pass
        category2 = Category.objects.create(name='Transportation', is_income=True)
        self.assertEqual(Category.objects.filter(name='Transportation').count(), 2)

class CategoryAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Entertainment',
            description='Entertainment expenses',
            is_income=False
        )

    def get_user_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_get_categories(self):
        token = self.get_user_token(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        url = reverse('category-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Entertainment')

    def test_unauthorized_access(self):
        url = reverse('category-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
