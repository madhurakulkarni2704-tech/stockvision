from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ExpiryProductSerializer
from .services import (
    get_expired_products,
    get_expiring_soon_products,
    get_safe_products,
)


class ExpiryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from products.models import Product

        products = Product.objects.filter(
            expiry_date__isnull=False
        ).order_by("expiry_date")

        serializer = ExpiryProductSerializer(
            products,
            many=True,
        )

        return Response(serializer.data)


class ExpiringSoonView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = get_expiring_soon_products()

        serializer = ExpiryProductSerializer(
            products,
            many=True,
        )

        return Response(serializer.data)


class ExpiredView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = get_expired_products()

        serializer = ExpiryProductSerializer(
            products,
            many=True,
        )

        return Response(serializer.data)


class SafeProductsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = get_safe_products()

        serializer = ExpiryProductSerializer(
            products,
            many=True,
        )

        return Response(serializer.data)