from decimal import Decimal

from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.response import Response

from inventory.models import Inventory, InventoryHistory

from .models import Sale
from .serializers import SaleSerializer


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related('product').all().order_by(
        '-sale_date'
    )
    serializer_class = SaleSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']
        selling_price = serializer.validated_data['selling_price']

        with transaction.atomic():
            try:
                inventory = Inventory.objects.select_for_update().get(
                    product=product
                )
            except Inventory.DoesNotExist:
                return Response(
                    {
                        'detail': (
                            'Inventory record does not exist for this product.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if quantity > inventory.quantity:
                return Response(
                    {
                        'detail': (
                            f'Insufficient stock. Available stock: '
                            f'{inventory.quantity}.'
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            previous_quantity = inventory.quantity
            new_quantity = previous_quantity - quantity
            total_amount = Decimal(quantity) * selling_price

            sale = Sale.objects.create(
                product=product,
                quantity=quantity,
                selling_price=selling_price,
                total_amount=total_amount,
            )

            inventory.quantity = new_quantity
            inventory.save()

            InventoryHistory.objects.create(
                inventory=inventory,
                transaction_type=InventoryHistory.STOCK_OUT,
                quantity=quantity,
                previous_quantity=previous_quantity,
                new_quantity=new_quantity,
            )

        response_serializer = self.get_serializer(sale)

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )

