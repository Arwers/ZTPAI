from django.contrib.auth import get_user_model
from core.models import Profile, Account, AccountType, Currency, Category, Transaction
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def populate():
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@example.com",
            "is_staff": True,
            "is_superuser": True,
        },
    )
    if created:
        admin_user.set_password("adminpass")
        admin_user.save()
        print("Admin user created.")
    else:
        print("Admin user already exists.")
    
    # Create normal user
    normal_user, created = User.objects.get_or_create(
        username="user",
        defaults={
            "email": "user@example.com",
            "is_staff": False,
            "is_superuser": False,
        },
    )
    if created:
        normal_user.set_password("userpass")
        normal_user.save()
        print("Normal user created.")
    else:
        print("Normal user already exists.")

    # Create profile for normal user
    profile, created = Profile.objects.get_or_create(user=normal_user, name="Main Profile")
    
    # Create currency
    currency, _ = Currency.objects.get_or_create(code="USD", defaults={"name": "US Dollar", "symbol": "$"})

    # Create account type
    account_type, _ = AccountType.objects.get_or_create(name="Checking")
    
    # Create account for the profile
    account, created = Account.objects.get_or_create(
        profile=profile,
        name="User's Checking Account",
        defaults={"account_type": account_type, "currency": currency, "balance": 1000.00},
    )
    
    # Create expense categories
    food_category, _ = Category.objects.get_or_create(name="Food", is_income=False)
    transport_category, _ = Category.objects.get_or_create(name="Transport", is_income=False)
    entertainment_category, _ = Category.objects.get_or_create(name="Entertainment", is_income=False)
    
    # Create transactions (expenses)
    expenses = [
        {"category": food_category, "amount": 25.00, "description": "Uber eats"},
        {"category": transport_category, "amount": 12.50, "description": "Parking ticket"},
        {"category": entertainment_category, "amount": 11.00, "description": "Theatre"},
        {"category": food_category, "amount": 5.00, "description": "Coffee"},
        {"category": transport_category, "amount": 7.25, "description": "Taxi ride"},
    ]
    # Get the current time
    base_time = timezone.now()

    # Create the transactions with different transaction dates
    for index, exp in enumerate(expenses):
        transaction_date = base_time + timedelta(days=index)  # Adjust date for each expense (e.g., add 1 day for the second, 2 days for the third)
        
        Transaction.objects.create(
            account=account,
            category=exp["category"],
            amount=exp["amount"],
            transaction_date=transaction_date,
            description=exp["description"]
        )
    
    print("Database populated successfully.")

populate()