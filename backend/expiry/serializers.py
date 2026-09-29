from rest_framework import serializers

from products.models import Product
from .services import get_days_remaining, get_expiry_status


class ExpiryProductSerializer(serializers.ModelSerializer):
    expiry_date = serializers.DateField(
        allow_null=True,
        read_only=True,
    )

    days_remaining = serializers.SerializerMethodField()
    expiry_status = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "sku",
            "category",
            "expiry_date",
            "days_remaining",
            "expiry_status",
        ]

    def get_days_remaining(self, obj):
        return get_days_remaining(obj.expiry_date)

    def get_expiry_status(self, obj):
        return get_expiry_status(obj.expiry_date)