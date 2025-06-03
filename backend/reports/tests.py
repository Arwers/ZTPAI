from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class ReportTestPlaceholder(TestCase):
    """
    Placeholder tests for reporting functionality.
    This app is reserved for future reporting features.
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_placeholder(self):
        """Placeholder test to ensure test discovery works"""
        self.assertTrue(True)
        
    # Future tests will include:
    # - Monthly/yearly spending reports
    # - Category-wise expense analysis
    # - Income vs expense trends
    # - Export functionality (PDF, CSV)
    # - Custom date range reports
