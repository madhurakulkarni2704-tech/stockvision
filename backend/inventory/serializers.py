from rest_framework import serializers

from .models import Inventory


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