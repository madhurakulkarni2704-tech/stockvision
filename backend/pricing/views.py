from decimal import Decimal

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from products.models import Product

from .models import Pricing
from .serializers import PricingSerializer
from .services import calculate_discount


class PricingViewSet(viewsets.ModelViewSet):
    queryset = Pricing.objects.select_related("product").all().order_by(
        "product__name"
    )
    serializer_class = PricingSerializer

    @action(
        detail=False,
        methods=["get"],
        url_path="suggestions",
    )
    def suggestions(self, request):
        products = Product.objects.filter(
            status="ACTIVE"
        ).order_by("name")

        results = []

        for product in products:
            calculation = calculate_discount(product)

            results.append({
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "original_price": product.price,
                **calculation,
            })

        return Response(results)

    @action(
        detail=True,
        methods=["get"],
        url_path="calculate",
    )
    def calculate(self, request, pk=None):
        pricing = self.get_object()
        calculation = calculate_discount(pricing.product)

        return Response({
            "product_id": pricing.product.id,
            "product_name": pricing.product.name,
            "sku": pricing.product.sku,
            "original_price": pricing.product.price,
            **calculation,
        })

    @action(
        detail=False,
        methods=["post"],
        url_path="calculate",
    )
    def calculate_product(self, request):
        product_id = request.data.get("product")

        if not product_id:
            return Response(
                {"detail": "Product is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Product.objects.get(
                id=product_id,
                status="ACTIVE",
            )
        except Product.DoesNotExist:
            return Response(
                {"detail": "Active product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        calculation = calculate_discount(product)

        return Response({
            "product_id": product.id,
            "product_name": product.name,
            "sku": product.sku,
            "original_price": product.price,
            **calculation,
        })

    @action(
        detail=True,
        methods=["put"],
        url_path="apply",
    )
    def apply_discount(self, request, pk=None):
        pricing = self.get_object()

        if pricing.product.status != "ACTIVE":
            return Response(
                {"detail": "Inactive products cannot have pricing applied."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        calculation = calculate_discount(pricing.product)

        if calculation["status"] == "DO NOT SELL":
            return Response(
                {"detail": "Expired products cannot be sold."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        discount = request.data.get(
            "discount_percentage",
            calculation["discount_percentage"],
        )

        try:
            discount = Decimal(str(discount))
        except (TypeError, ValueError):
            return Response(
                {"detail": "Discount percentage must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if discount < 0 or discount > 100:
            return Response(
                {"detail": "Discount percentage must be between 0 and 100."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        discounted_price = (
            pricing.product.price
            * (Decimal("1") - discount / Decimal("100"))
        ).quantize(Decimal("0.01"))

        pricing.discount_percentage = discount
        pricing.discounted_price = discounted_price
        pricing.is_applied = True
        pricing.save()

        return Response(
            PricingSerializer(pricing).data,
            status=status.HTTP_200_OK,
        )