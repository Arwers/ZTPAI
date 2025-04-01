from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from django.db.models import Sum
from ..serializers import RegisterSerializer, LoginSerializer, ExpenseSerializer
from ..models import Transaction, Profile

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

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
        expenses = Transaction.objects.filter(
            account__profile=profile,
            category__is_income=False,
            transaction_date__range=[start_date, end_date],
        ).aggregate(total=Sum("amount"))
        return Response({"total_expenses": expenses["total"] or 0.00})
