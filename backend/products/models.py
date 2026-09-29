from django.db import models


class Product(models.Model):

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    ]

    name = models.CharField(
        max_length=200
    )

    sku = models.CharField(
        max_length=100,
        unique=True
    )

    category = models.CharField(
        max_length=100,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True
    )

    unit = models.CharField(
        max_length=50,
        blank=True
    )

    expiry_date = models.DateField(
    null=True,
    blank=True
    )   

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.name} ({self.sku})"