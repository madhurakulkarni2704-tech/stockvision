from django.db import models
from products.models import Product


class Alert(models.Model):
    LOW_STOCK = "LOW STOCK"
    EXPIRING_SOON = "EXPIRING SOON"
    EXPIRED = "EXPIRED"
    DISCOUNT_REQUIRED = "DISCOUNT REQUIRED"
    OUT_OF_STOCK = "OUT OF STOCK"

    ALERT_TYPE_CHOICES = [
        (LOW_STOCK, "Low Stock"),
        (EXPIRING_SOON, "Expiring Soon"),
        (EXPIRED, "Expired"),
        (DISCOUNT_REQUIRED, "Discount Required"),
        (OUT_OF_STOCK, "Out of Stock"),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="alerts",
    )
    alert_type = models.CharField(
        max_length=30,
        choices=ALERT_TYPE_CHOICES,
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.alert_type} - {self.product.name}"