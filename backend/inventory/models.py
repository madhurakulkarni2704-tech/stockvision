from django.db import models

from products.models import Product


class Inventory(models.Model):
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name='inventory'
    )

    quantity = models.PositiveIntegerField(
        default=0
    )

    low_stock_threshold = models.PositiveIntegerField(
        default=10
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.product.name} - {self.quantity} units"

    @property
    def status(self):
        if self.quantity == 0:
            return "Out of Stock"
        elif self.quantity <= self.low_stock_threshold:
            return "Low Stock"
        return "In Stock"


class InventoryHistory(models.Model):
    STOCK_IN = "STOCK_IN"
    STOCK_OUT = "STOCK_OUT"

    TRANSACTION_CHOICES = [
        (STOCK_IN, "Stock In"),
        (STOCK_OUT, "Stock Out"),
    ]

    inventory = models.ForeignKey(
        Inventory,
        on_delete=models.CASCADE,
        related_name="history"
    )

    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_CHOICES
    )

    quantity = models.PositiveIntegerField()

    previous_quantity = models.PositiveIntegerField()

    new_quantity = models.PositiveIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.inventory.product.name} - "
            f"{self.transaction_type} - "
            f"{self.quantity} units"
        )