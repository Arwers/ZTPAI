from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from ..models import *


class ExpensesViewSet(viewsets.ViewSet):
    def create(self, request):
        expense = request.data
        expense["id"] = len(expenses) + 1
        expenses.append(expense)
        return Response(expense, status=status.HTTP_201_CREATED)

    def list(self, request):
        """Get all expenses for a specific user by user ID if authenticated"""
        auth_header = request.headers.get("Authorization")
        if auth_header != f"Bearer {auth_token[1]}":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.query_params.get("id_user")
        if not user_id or not user_id.isdigit():
            return Response(
                {"error": "Invalid or missing user_id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = next((u for u in users if u["id"] == int(user_id)), None)
        if not user:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user_expenses = [e for e in expenses if e["id_user"] == int(user_id)]
        return Response(user_expenses)

    @action(detail=False, methods=["get"])
    def total(self, request):
        """Get total value of expenses for a user"""
        auth_header = request.headers.get("Authorization")
        if auth_header != f"Bearer {auth_token[1]}":
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        user_id = request.query_params.get("id_user")
        if user_id:
            total = sum(e["price"] for e in expenses if e["id_user"] == int(user_id))
            return Response({"total": total})
        return Response(
            {"error": "User ID required"}, status=status.HTTP_400_BAD_REQUEST
        )
