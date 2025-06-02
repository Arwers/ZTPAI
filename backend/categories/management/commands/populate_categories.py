from django.core.management.base import BaseCommand
from categories.models import Category
from django.db import transaction


class Command(BaseCommand):
    help = 'Populates the database with sample categories'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate categories...')
        
        # Use transaction to ensure all or nothing is applied
        with transaction.atomic():
            self._create_categories()
            
        self.stdout.write(self.style.SUCCESS('Successfully populated sample categories!'))
    
    def _create_categories(self):
        # Define categories to create (3 income, 3 expense categories)
        categories = [
            {
                'name': 'Salary',
                'description': 'Regular income from employment',
                'is_income': True
            },
            {
                'name': 'Investments',
                'description': 'Income from investments, dividends, and interest',
                'is_income': True
            },
            {
                'name': 'Gifts',
                'description': 'Money received as gifts or rewards',
                'is_income': True
            },
            {
                'name': 'Food & Groceries',
                'description': 'Expenses for food, groceries, and dining out',
                'is_income': False
            },
            {
                'name': 'Housing',
                'description': 'Rent, mortgage, utilities, and home maintenance',
                'is_income': False
            },
            {
                'name': 'Entertainment',
                'description': 'Movies, music, games, and other leisure activities',
                'is_income': False
            }
        ]
        
        # Track created categories
        created_count = 0
        
        # Create each category if it doesn't exist
        for category_data in categories:
            category, created = Category.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'is_income': category_data['is_income']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'Created category: {category.name} ({"Income" if category.is_income else "Expense"})')
            else:
                self.stdout.write(f'Category already exists: {category.name}')
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} categories'))
