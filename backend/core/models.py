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
