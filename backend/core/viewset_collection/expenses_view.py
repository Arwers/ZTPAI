from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from django.db.models import Sum
from ..serializers import RegisterSerializer, LoginSerializer, ExpenseSerializer
from ..models import Transaction, Category, Account, Profile
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

User = get_user_model()


class ExpensesViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def list_expenses(self, request):
        profile = Profile.objects.get(user=request.user)
        expenses = Transaction.objects.filter(
            account__profile=profile, category__is_income=False
        )
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def get_expense(self, request, pk=None):
        try:
            expense = Transaction.objects.get(
                pk=pk, account__profile__user=request.user, category__is_income=False
            )
            serializer = ExpenseSerializer(expense)
            return Response(serializer.data)
        except Transaction.DoesNotExist:
            return Response(
                {"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def total_expenses(self, request):
        profile = Profile.objects.get(user=request.user)
        
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")
        
        # Convert the end_date string to a datetime object
        if end_date:
            end_date = datetime.strptime(end_date, "%Y-%m-%d")
            # Add one day to the end_date
            end_date = end_date + timedelta(days=1)
        
        # Query for transactions within the date range
        expenses = Transaction.objects.filter(
            account__profile=profile,
            category__is_income=False,
            transaction_date__range=[start_date, end_date],
        ).aggregate(total=Sum("amount"))
        
        return Response({"total_expenses": expenses["total"] or 0.00})

    @action(detail=True, methods=["delete"])
    def delete_expense(self, request, pk=None):
        try:
            # Retrieve the expense by ID
            transaction = Transaction.objects.get(id=pk, account__profile__user=request.user)

            # Delete the transaction
            transaction.delete()

            return Response({"message": "Expense deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

        except Transaction.DoesNotExist:
            return Response({"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=["post"], url_path="add_expense")
    def add_expense(self, request):
        # Extract data from the request
        account_name = request.data.get("account_name")
        category_name = request.data.get("category")  # Ensure this is 'category', not 'category_name'
        amount = request.data.get("amount")
        transaction_date = request.data.get("transaction_date")
        description = request.data.get("description")
        
        # Ensure necessary fields are provided
        if not account_name or not category_name or not amount or not transaction_date:
            return Response({"error": "Account name, category, amount, and transaction date are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the account for the user
            account = Account.objects.get(name=account_name, profile__user=request.user)

            # Check if the category exists
            category, _ = Category.objects.get_or_create(name=category_name, is_income=False)

            # Ensure the transaction_date is properly formatted and converted to datetime
            transaction_date = timezone.make_aware(datetime.strptime(transaction_date, "%Y-%m-%dT%H:%M:%S"))

            # Create the transaction
            transaction = Transaction.objects.create(
                account=account,
                category=category,
                amount=amount,
                transaction_date=transaction_date,
                description=description
            )

            return Response({"message": "Expense added successfully", "transaction_id": transaction.id}, status=status.HTTP_201_CREATED)

        except Account.DoesNotExist:
            return Response({"error": "Account not found."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
