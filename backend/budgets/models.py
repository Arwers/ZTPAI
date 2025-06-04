from django.db import models
from accounts.models import Account
from categories.models import Category


class Budget(models.Model):
    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name="budgets"
    )
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="budgets"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"Budget for {self.category.name} ({self.account.name})"


class Goal(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="goals")
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    due_date = models.DateField()

    def __str__(self):
        return f"{self.name} ({self.account.name})"
