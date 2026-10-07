from rest_framework import viewsets

from .models import Product
from .serializers import ProductSerializer
from .permissions import ProductPermission
from inventory.models import Inventory


class ProductViewSet(viewsets.ModelViewSet):

    queryset = Product.objects.all().order_by('-created_at')

    serializer_class = ProductSerializer

    permission_classes = [ProductPermission]

    def perform_create(self, serializer):
        product = serializer.save()

        Inventory.objects.get_or_create(
            product=product,
            defaults={
                'quantity': 0,
                'low_stock_threshold': 10,
            },
        )