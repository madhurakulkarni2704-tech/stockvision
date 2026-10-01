from rest_framework import serializers

from .models import Alert


class AlertSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    product_sku = serializers.CharField(
        source="product.sku",
        read_only=True
    )

    class Meta:
        model = Alert
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "alert_type",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "product_name",
            "product_sku",
            "alert_type",
            "message",
            "created_at",
        ]