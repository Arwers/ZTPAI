from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from ..models import *


class CredentialsViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @method_decorator(csrf_exempt)
    def create(self, request):
        """Return a token if credentials are valid"""
        username = request.data.get("username")
        password = request.data.get("password")
        user = next(
            (
                u
                for u in users
                if u["username"] == username and u["password"] == password
            ),
            None,
        )
        if user:
            token = auth_token[user["role"]]
            return Response({"token": token})
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )
