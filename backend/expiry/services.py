from datetime import date, timedelta

from products.models import Product


SAFE = "SAFE"
EXPIRING_SOON = "EXPIRING SOON"
EXPIRED = "EXPIRED"

EXPIRING_SOON_DAYS = 7


def get_expiry_status(expiry_date):
    """
    Return the expiry status for a product.

    SAFE:
        More than 7 days remaining.

    EXPIRING SOON:
        0 to 7 days remaining.

    EXPIRED:
        Expiry date has already passed.

    Products without an expiry date are treated as SAFE.
    """
    if expiry_date is None:
        return SAFE

    today = date.today()
    days_remaining = (expiry_date - today).days

    if days_remaining < 0:
        return EXPIRED

    if days_remaining <= EXPIRING_SOON_DAYS:
        return EXPIRING_SOON

    return SAFE


def get_days_remaining(expiry_date):
    """
    Return the number of days remaining until expiry.

    Negative values mean the product has already expired.

    Products without an expiry date return None.
    """
    if expiry_date is None:
        return None

    return (expiry_date - date.today()).days


def get_product_expiry_data(product):
    """
    Return calculated expiry information for a product.
    """
    days_remaining = get_days_remaining(product.expiry_date)

    return {
        "product": product,
        "expiry_date": product.expiry_date,
        "days_remaining": days_remaining,
        "status": get_expiry_status(product.expiry_date),
    }


def get_expired_products():
    """
    Return products whose expiry date has already passed.
    """
    return Product.objects.filter(
        expiry_date__lt=date.today()
    ).order_by("expiry_date")


def get_expiring_soon_products():
    """
    Return products expiring today through the next 7 days.
    """
    today = date.today()
    expiry_limit = today + timedelta(days=EXPIRING_SOON_DAYS)

    return Product.objects.filter(
        expiry_date__gte=today,
        expiry_date__lte=expiry_limit,
    ).order_by("expiry_date")


def get_safe_products():
    """
    Return products with more than 7 days remaining.

    Products without an expiry date are not included because
    their expiry status cannot be calculated from a date.
    """
    today = date.today()
    safe_after = today + timedelta(days=EXPIRING_SOON_DAYS)

    return Product.objects.filter(
        expiry_date__gt=safe_after
    ).order_by("expiry_date")