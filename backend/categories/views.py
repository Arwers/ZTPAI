from django.shortcuts import render
from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from accounts.authentication import CookieJWTAuthentication
from .models import Category
from .serializers import CategorySerializer

@extend_schema_view(
    list=extend_schema(
        summary="List categories",
        description="Get all available categories for transactions",
        responses={
            200: CategorySerializer(many=True),
            401: OpenApiResponse(description="Authentication required")
        }
    ),
    retrieve=extend_schema(
        summary="Get category details",
        description="Retrieve a specific category by ID",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Category ID",
                required=True
            )
        ],
        responses={
            200: CategorySerializer,
            401: OpenApiResponse(description="Authentication required"),
            404: OpenApiResponse(description="Category not found")
        }
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

