from datetime import date, timedelta
from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from inventory.models import Inventory, InventoryHistory
from products.models import Product

from .models import Pricing
from .services import calculate_discount


class PricingCalculationTests(TestCase):

    def setUp(self):
        self.product = Product.objects.create(
            name="Milk",
            sku="MILK-001",
            category="Dairy",
            price=Decimal("50.00"),
            expiry_date=date.today() + timedelta(days=10),
            status="ACTIVE",
        )

        self.inventory = Inventory.objects.create(
            product=self.product,
            quantity=5,
            low_stock_threshold=10,
        )

    def test_product_more_than_7_days_has_normal_price(self):
        result = calculate_discount(self.product)

        self.assertEqual(
            result["discount_percentage"],
            Decimal("0"),
        )
        self.assertEqual(
            result["suggested_price"],
            Decimal("50.00"),
        )
        self.assertEqual(
            result["status"],
            "ACTIVE",
        )

    def test_product_3_to_7_days_gets_small_discount(self):
        self.product.expiry_date = (
            date.today() + timedelta(days=5)
        )
        self.product.save()

        result = calculate_discount(self.product)

        self.assertEqual(
            result["discount_percentage"],
            Decimal("5"),
        )
        self.assertEqual(
            result["suggested_price"],
            Decimal("47.50"),
        )

    def test_product_1_to_2_days_gets_high_discount(self):
        self.product.expiry_date = (
            date.today() + timedelta(days=2)
        )
        self.product.save()

        result = calculate_discount(self.product)

        self.assertEqual(
            result["discount_percentage"],
            Decimal("20"),
        )
        self.assertEqual(
            result["suggested_price"],
            Decimal("40.00"),
        )

    def test_expired_product_cannot_be_sold(self):
        self.product.expiry_date = (
            date.today() - timedelta(days=1)
        )
        self.product.save()

        result = calculate_discount(self.product)

        self.assertEqual(
            result["status"],
            "DO NOT SELL",
        )
        self.assertIsNone(
            result["suggested_price"]
        )
        self.assertEqual(
            result["discount_percentage"],
            Decimal("0"),
        )

    def test_high_stock_gets_small_discount(self):
        self.inventory.quantity = 50
        self.inventory.save()

        result = calculate_discount(self.product)

        self.assertEqual(
            result["discount_percentage"],
            Decimal("5"),
        )
        self.assertEqual(
            result["suggested_price"],
            Decimal("47.50"),
        )

    def test_stock_out_history_is_used_as_demand_signal(self):
        InventoryHistory.objects.create(
            inventory=self.inventory,
            transaction_type=InventoryHistory.STOCK_OUT,
            quantity=2,
            previous_quantity=7,
            new_quantity=5,
        )

        result = calculate_discount(self.product)

        self.assertEqual(
            result["recent_stock_outs"],
            1,
        )

    def test_no_expiry_date_uses_stock_condition(self):
        self.product.expiry_date = None
        self.product.save()

        self.inventory.quantity = 5
        self.inventory.save()

        result = calculate_discount(self.product)

        self.assertEqual(
            result["discount_percentage"],
            Decimal("0"),
        )
        self.assertEqual(
            result["suggested_price"],
            Decimal("50.00"),
        )


class PricingAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.product = Product.objects.create(
            name="Milk",
            sku="MILK-API-001",
            category="Dairy",
            price=Decimal("50.00"),
            expiry_date=date.today() + timedelta(days=2),
            status="ACTIVE",
        )

        self.inventory = Inventory.objects.create(
            product=self.product,
            quantity=20,
            low_stock_threshold=10,
        )

    def test_pricing_list_endpoint(self):
        response = self.client.get("/api/pricing/")

        self.assertEqual(response.status_code, 200)

    def test_pricing_suggestions_endpoint(self):
        response = self.client.get(
            "/api/pricing/suggestions/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        result = response.data[0]

        self.assertEqual(
            result["product_id"],
            self.product.id,
        )
        self.assertEqual(
            result["discount_percentage"],
            20.0,
        )
        self.assertEqual(
            result["suggested_price"],
            40.0,
        )
        self.assertEqual(
            result["status"],
            "ACTIVE",
        )

    def test_calculate_endpoint(self):
        response = self.client.post(
            "/api/pricing/calculate/",
            {
                "product": self.product.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["discount_percentage"],
            20.0,
        )
        self.assertEqual(
            response.data["suggested_price"],
            40.0,
        )

    def test_create_pricing_record(self):
        response = self.client.post(
            "/api/pricing/",
            {
                "product": self.product.id,
                "discount_percentage": "20",
                "discounted_price": "40.00",
                "is_applied": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        self.assertEqual(
            response.data["product"],
            self.product.id,
        )

        self.assertEqual(
            response.data["discount_percentage"],
            "20.00",
        )

        self.assertEqual(
            response.data["discounted_price"],
            "40.00",
        )

    def test_apply_discount_endpoint(self):
        pricing = Pricing.objects.create(
            product=self.product,
            discount_percentage=Decimal("20"),
            discounted_price=Decimal("40.00"),
            is_applied=False,
        )

        response = self.client.put(
            f"/api/pricing/{pricing.id}/apply/",
            {
                "discount_percentage": "20",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        pricing.refresh_from_db()

        self.assertTrue(pricing.is_applied)
        self.assertEqual(
            pricing.discount_percentage,
            Decimal("20"),
        )
        self.assertEqual(
            pricing.discounted_price,
            Decimal("40.00"),
        )

    def test_expired_product_cannot_be_applied(self):
        self.product.expiry_date = (
            date.today() - timedelta(days=1)
        )
        self.product.save()

        pricing = Pricing.objects.create(
            product=self.product,
            discount_percentage=Decimal("20"),
            discounted_price=Decimal("40.00"),
            is_applied=False,
        )

        response = self.client.put(
            f"/api/pricing/{pricing.id}/apply/",
            {
                "discount_percentage": "20",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)