from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Transaction
from .serializers import TransactionSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from accounts.authentication import CookieJWTAuthentication

@extend_schema_view(
    list=extend_schema(description="List all transactions for the authenticated user"),
    retrieve=extend_schema(
        description="Get a specific transaction by ID",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Transaction ID",
                required=True
            )
        ]
    ),
    create=extend_schema(description="Create a new transaction"),
    update=extend_schema(
        description="Update an existing transaction",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Transaction ID",
                required=True
            )
        ]
    ),
    partial_update=extend_schema(
        description="Partially update an existing transaction",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Transaction ID",
                required=True
            )
        ]
    ),
    destroy=extend_schema(
        description="Delete a transaction",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Transaction ID",
                required=True
            )
        ]
    )
)
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer
    authentication_classes = [CookieJWTAuthentication]

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(account__user=user)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="account_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="ID of the account to fetch transactions for",
                required=True
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_account(self, request):
        account_id = request.query_params.get('account_id')
        
        if not account_id:
            return Response(
                {"detail": "account_id parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = Transaction.objects.filter(
            account__id=account_id,
            account__user=request.user
        ).order_by('-transaction_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
