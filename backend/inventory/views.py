from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Inventory, InventoryHistory
from .serializers import InventoryHistorySerializer, InventorySerializer
from .permissions import InventoryPermission


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('product').all().order_by('-updated_at')
    serializer_class = InventorySerializer
    permission_classes = [InventoryPermission]

    @action(detail=True, methods=['post'], url_path='add-stock')
    def add_stock(self, request, pk=None):
        inventory = self.get_object()

        try:
            quantity = int(request.data.get('quantity', 0))
        except (TypeError, ValueError):
            return Response(
                {'detail': 'Quantity must be a valid number.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:
            return Response(
                {'detail': 'Quantity must be greater than 0.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        previous_quantity = inventory.quantity
        inventory.quantity += quantity
        inventory.save()

        InventoryHistory.objects.create(
            inventory=inventory,
            transaction_type=InventoryHistory.STOCK_IN,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=inventory.quantity,
        )

        return Response(
            InventorySerializer(inventory).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='reduce-stock')
    def reduce_stock(self, request, pk=None):
        inventory = self.get_object()

        try:
            quantity = int(request.data.get('quantity', 0))
        except (TypeError, ValueError):
            return Response(
                {'detail': 'Quantity must be a valid number.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:
            return Response(
                {'detail': 'Quantity must be greater than 0.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > inventory.quantity:
            return Response(
                {'detail': 'Cannot reduce stock below 0.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        previous_quantity = inventory.quantity
        inventory.quantity -= quantity
        inventory.save()

        InventoryHistory.objects.create(
            inventory=inventory,
            transaction_type=InventoryHistory.STOCK_OUT,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=inventory.quantity,
        )

        return Response(
            InventorySerializer(inventory).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        inventory = self.get_object()

        history = inventory.history.all().order_by('-created_at')

        serializer = InventoryHistorySerializer(
            history,
            many=True
        )

        return Response(serializer.data)