from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Inventory
from .serializers import InventorySerializer


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.select_related('product').all().order_by('-updated_at')
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]