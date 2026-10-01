from datetime import date, timedelta

from products.models import Product
from inventory.models import Inventory

from .models import Alert


EXPIRING_SOON_DAYS = 7


def create_alert_if_not_exists(product, alert_type, message):
    alert = Alert.objects.filter(
        product=product,
        alert_type=alert_type,
    ).first()

    if alert:
        # An existing alert is reused, including dismissed alerts.
        # This prevents a dismissed alert from being recreated.
        return alert, False

    alert = Alert.objects.create(
        product=product,
        alert_type=alert_type,
        message=message,
    )

    return alert, True


def generate_stock_alerts():
    created_alerts = []

    inventories = Inventory.objects.select_related("product")

    for inventory in inventories:
        product = inventory.product

        if inventory.quantity == 0:
            message = f'Product "{product.name}" is out of stock.'

            alert, created = create_alert_if_not_exists(
                product,
                Alert.OUT_OF_STOCK,
                message,
            )

            if created:
                created_alerts.append(alert)

        elif inventory.quantity <= inventory.low_stock_threshold:
            message = (
                f'Product "{product.name}" stock is below the minimum level.'
            )

            alert, created = create_alert_if_not_exists(
                product,
                Alert.LOW_STOCK,
                message,
            )

            if created:
                created_alerts.append(alert)

    return created_alerts


def generate_expiry_alerts():
    created_alerts = []

    today = date.today()
    products = Product.objects.filter(expiry_date__isnull=False)

    for product in products:
        days_remaining = (product.expiry_date - today).days

        if days_remaining < 0:
            message = f'Product "{product.name}" has expired.'

            alert, created = create_alert_if_not_exists(
                product,
                Alert.EXPIRED,
                message,
            )

            if created:
                created_alerts.append(alert)

        elif days_remaining <= EXPIRING_SOON_DAYS:
            message = (
                f'Product "{product.name}" expires in '
                f'{days_remaining} days.'
            )

            alert, created = create_alert_if_not_exists(
                product,
                Alert.EXPIRING_SOON,
                message,
            )

            if created:
                created_alerts.append(alert)

    return created_alerts


def generate_discount_alerts():
    created_alerts = []

    today = date.today()
    expiry_limit = today + timedelta(days=EXPIRING_SOON_DAYS)

    products = Product.objects.filter(
        expiry_date__isnull=False,
        expiry_date__lte=expiry_limit,
        expiry_date__gte=today,
    )

    for product in products:
        message = (
            f'Product "{product.name}" requires a discount '
            f'because it is approaching expiry.'
        )

        alert, created = create_alert_if_not_exists(
            product,
            Alert.DISCOUNT_REQUIRED,
            message,
        )

        if created:
            created_alerts.append(alert)

    return created_alerts


def generate_all_alerts():
    alerts = []

    alerts.extend(generate_stock_alerts())
    alerts.extend(generate_expiry_alerts())
    alerts.extend(generate_discount_alerts())

    return alerts