from rest_framework import serializers

from .models import Inventory, InventoryHistory


class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    sku = serializers.CharField(
        source='product.sku',
        read_only=True
    )

    price = serializers.DecimalField(
        source='product.price',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    status = serializers.ReadOnlyField()

    class Meta:
        model = Inventory
        fields = [
            'id',
            'product',
            'product_name',
            'sku',
            'quantity',
            'low_stock_threshold',
            'price',
            'status',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'product_name',
            'sku',
            'price',
            'status',
            'updated_at',
        ]

class InventoryHistorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='inventory.product.name',
        read_only=True
    )

    class Meta:
        model = InventoryHistory
        fields = [
            'id',
            'inventory',
            'product_name',
            'transaction_type',
            'quantity',
            'previous_quantity',
            'new_quantity',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'inventory',
            'product_name',
            'transaction_type',
            'quantity',
            'previous_quantity',
            'new_quantity',
            'created_at',
        ]