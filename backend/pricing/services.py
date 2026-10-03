from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone

from expiry.services import get_days_remaining
from inventory.models import Inventory, InventoryHistory


# Centralized discount percentages.
EXPIRY_DISCOUNTS = {
    "NORMAL": Decimal("0"),
    "SMALL": Decimal("5"),
    "HIGH": Decimal("20"),
}


def calculate_discount(product):
    """
    Calculate a suggested discount using:
    - expiry proximity
    - current stock
    - recent stock-out history as a demand signal

    Expired products must not be sold.
    """

    inventory = Inventory.objects.filter(
        product=product
    ).first()

    quantity = inventory.quantity if inventory else 0

    threshold = (
        inventory.low_stock_threshold
        if inventory
        else 10
    )

    days_remaining = get_days_remaining(
        product.expiry_date
    )

    # Expired products cannot be sold.
    if days_remaining is not None and days_remaining < 0:
        return {
            "discount_percentage": Decimal("0"),
            "suggested_price": None,
            "status": "DO NOT SELL",
            "reason": "Product has expired.",
            "days_remaining": days_remaining,
            "stock_quantity": quantity,
            "recent_stock_outs": 0,
        }

    # Determine discount from expiry proximity.
    if days_remaining is None or days_remaining > 7:
        discount = EXPIRY_DISCOUNTS["NORMAL"]
    elif days_remaining >= 3:
        discount = EXPIRY_DISCOUNTS["SMALL"]
    else:
        discount = EXPIRY_DISCOUNTS["HIGH"]

    # High stock can trigger at least a small discount.
    if threshold > 0 and quantity > threshold * 2:
        discount = max(
            discount,
            EXPIRY_DISCOUNTS["SMALL"],
        )

    # Use recent stock-outs as a demand indicator.
    recent_stock_outs = InventoryHistory.objects.filter(
        inventory__product=product,
        transaction_type=InventoryHistory.STOCK_OUT,
        created_at__gte=timezone.now() - timedelta(days=30),
    ).count()

    suggested_price = (
        product.price
        * (Decimal("1") - discount / Decimal("100"))
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    return {
        "discount_percentage": discount,
        "suggested_price": suggested_price,
        "status": "ACTIVE",
        "reason": get_discount_reason(
            days_remaining,
            quantity,
            threshold,
        ),
        "days_remaining": days_remaining,
        "stock_quantity": quantity,
        "recent_stock_outs": recent_stock_outs,
    }


def get_discount_reason(
    days_remaining,
    quantity,
    threshold,
):
    if days_remaining is not None:
        if days_remaining <= 2:
            return "High discount due to expiry proximity."

        if days_remaining <= 7:
            return "Small discount due to expiry proximity."

    if threshold > 0 and quantity > threshold * 2:
        return "Discount suggested due to high stock."

    return "Normal pricing recommended."