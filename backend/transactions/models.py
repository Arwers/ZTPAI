from django.db import models
from accounts.models import Account
from categories.models import Category


class Transaction(models.Model):
    RECURRING_FREQUENCIES = [
        ("none", "One-time"),
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]

    account = models.ForeignKey(
        Account, on_delete=models.CASCADE, related_name="transactions", db_index=True
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="transactions"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateTimeField()
    description = models.TextField(blank=True, null=True)

    # Recurrence
    frequency = models.CharField(
        max_length=20, choices=RECURRING_FREQUENCIES, default="none"
    )
    next_due_date = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def is_recurring(self):
        return self.frequency != "none"

    def __str__(self):
        rec = f" ({self.frequency})" if self.is_recurring() else ""
        return f"{self.category.name}: {self.amount} ({self.account.name}){rec}"
