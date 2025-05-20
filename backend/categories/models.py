from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_income = models.BooleanField()

    def __str__(self):
        return self.name
