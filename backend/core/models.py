from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    is_email_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='profiles')
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_profile_per_user'),
            models.CheckConstraint(check=models.Q(user__profiles__count__lte=4), name='max_four_profiles_per_user')
        ]
    
    def __str__(self):
        return f"{self.name} ({self.user.username})"

class Currency(models.Model):
    code = models.CharField(max_length=3, unique=True)
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)
    
    def __str__(self):
        return self.code

class AccountType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class Account(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='accounts')
    account_type = models.ForeignKey(AccountType, on_delete=models.SET_NULL, null=True, related_name='accounts')
    name = models.CharField(max_length=100)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    currency = models.ForeignKey(Currency, on_delete=models.SET_NULL, null=True, related_name='accounts')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.profile.name})"
