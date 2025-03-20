from rest_framework import viewsets, status
from rest_framework.response import Response

from ..models import *


class UsersViewSet(viewsets.ViewSet):
    def create(self, request):
        """Add a new user, ensuring unique email and username"""
        user = request.data
        if any(
            u["email"] == user["email"] or u["username"] == user["username"]
            for u in users
        ):
            return Response(
                {"error": "Email or username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user["id"] = len(users) + 1
        users.append(user)
        return Response(user, status=status.HTTP_201_CREATED)

    def list(self, request):
        """Get user data if admin token is provided"""
        auth_header = request.headers.get("Authorization")
        if auth_header == f"Bearer {auth_token[0]}":
            return Response(users)
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

    def retrieve(self, request, pk=None):
        """Get a user by ID if admin token is provided"""
        auth_header = request.headers.get("Authorization")
        if auth_header == f"Bearer {auth_token[0]}":
            user = next((u for u in users if u["id"] == int(pk)), None)
            if user:
                return Response(user)
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
