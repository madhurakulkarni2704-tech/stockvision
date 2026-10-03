from rest_framework import serializers

from .models import Pricing


class PricingSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    sku = serializers.CharField(
        source="product.sku",
        read_only=True,
    )

    original_price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Pricing
        fields = [
            "id",
            "product",
            "product_name",
            "sku",
            "original_price",
            "discount_percentage",
            "discounted_price",
            "is_applied",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "sku",
            "original_price",
            "updated_at",
        ]