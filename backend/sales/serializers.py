from decimal import Decimal

from rest_framework import serializers

from .models import Sale


class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source='product.name',
        read_only=True
    )

    sku = serializers.CharField(
        source='product.sku',
        read_only=True
    )

    class Meta:
        model = Sale
        fields = [
            'id',
            'product',
            'product_name',
            'sku',
            'quantity',
            'selling_price',
            'total_amount',
            'sale_date',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'product_name',
            'sku',
            'total_amount',
            'sale_date',
            'created_at',
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'Quantity must be greater than 0.'
            )

        return value

    def validate_selling_price(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError(
                'Selling price must be greater than 0.'
            )

        return value