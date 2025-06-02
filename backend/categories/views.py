from django.shortcuts import render
from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from accounts.authentication import CookieJWTAuthentication
from .models import Category
from .serializers import CategorySerializer

@extend_schema_view(
    list=extend_schema(description="List all categories"),
    retrieve=extend_schema(
        description="Get a specific category by ID",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Category ID",
                required=True
            )
        ]
    )
)
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing categories.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    authentication_classes = [CookieJWTAuthentication]

