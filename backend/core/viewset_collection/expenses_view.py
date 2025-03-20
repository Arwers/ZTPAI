from rest_framework import viewsets
from rest_framework.response import Response

class ExpensesViewSet(viewsets.ViewSet):
    def list(self, request):
        return Response({"message": "Hello, World!"})