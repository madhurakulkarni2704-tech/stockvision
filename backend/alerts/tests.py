from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from inventory.models import Inventory
from products.models import Product

from .models import Alert
from .services import generate_all_alerts


class AlertServiceTests(TestCase):

    def setUp(self):
        self.product = Product.objects.create(
            name="Test Milk",
            sku="TEST-MILK-001",
            category="Dairy",
            price=50,
            expiry_date=date.today() + timedelta(days=2),
        )

        self.inventory = Inventory.objects.create(
            product=self.product,
            quantity=5,
            low_stock_threshold=10,
        )

    def test_low_stock_alert_is_created(self):
        generate_all_alerts()

        self.assertTrue(
            Alert.objects.filter(
                product=self.product,
                alert_type=Alert.LOW_STOCK,
            ).exists()
        )

    def test_expiring_soon_alert_is_created(self):
        generate_all_alerts()

        self.assertTrue(
            Alert.objects.filter(
                product=self.product,
                alert_type=Alert.EXPIRING_SOON,
            ).exists()
        )

    def test_discount_required_alert_is_created(self):
        generate_all_alerts()

        self.assertTrue(
            Alert.objects.filter(
                product=self.product,
                alert_type=Alert.DISCOUNT_REQUIRED,
            ).exists()
        )

    def test_duplicate_alerts_are_not_created(self):
        generate_all_alerts()
        generate_all_alerts()

        self.assertEqual(
            Alert.objects.filter(
                product=self.product,
                alert_type=Alert.LOW_STOCK,
            ).count(),
            1,
        )

    def test_out_of_stock_alert_is_created(self):
        self.inventory.quantity = 0
        self.inventory.save()

        generate_all_alerts()

        self.assertTrue(
            Alert.objects.filter(
                product=self.product,
                alert_type=Alert.OUT_OF_STOCK,
            ).exists()
        )

    def test_expired_alert_is_created(self):
        self.product.expiry_date = date.today() - timedelta(days=2)
        self.product.save()

        generate_all_alerts()

        self.assertTrue(
            Alert.objects.filter(
                product=self.product,
                alert_type=Alert.EXPIRED,
            ).exists()
        )

    def test_dismissed_alert_is_not_recreated(self):
        generate_all_alerts()

        alert = Alert.objects.get(
            product=self.product,
            alert_type=Alert.LOW_STOCK,
        )

        alert.is_dismissed = True
        alert.save()

        generate_all_alerts()

        self.assertEqual(
            Alert.objects.filter(
                product=self.product,
                alert_type=Alert.LOW_STOCK,
            ).count(),
            1,
        )


class AlertAPITests(TestCase):

    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="alerttest",
            password="TestPassword123!",
        )

        self.product = Product.objects.create(
            name="API Test Milk",
            sku="API-MILK-001",
            price=50,
        )

        self.alert = Alert.objects.create(
            product=self.product,
            alert_type=Alert.LOW_STOCK,
            message="Test low stock alert.",
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_alert_list_api(self):
        response = self.client.get("/api/alerts/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_mark_alert_as_read(self):
        response = self.client.put(
            f"/api/alerts/{self.alert.id}/read/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_read"])

    def test_dismiss_alert(self):
        response = self.client.delete(
            f"/api/alerts/{self.alert.id}/"
        )

        self.assertEqual(response.status_code, 204)

        self.alert.refresh_from_db()

        self.assertTrue(self.alert.is_dismissed)

    def test_unread_filter(self):
        response = self.client.get(
            "/api/alerts/?read=false"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        self.alert.is_read = True
        self.alert.save()

        response = self.client.get(
            "/api/alerts/?read=false"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_alert_type_filter(self):
        response = self.client.get(
            "/api/alerts/?type=LOW%20STOCK"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["alert_type"],
            Alert.LOW_STOCK,
        )