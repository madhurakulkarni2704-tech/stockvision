from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from products.models import Product
from inventory.models import Inventory, InventoryHistory
from accounts.models import UserProfile


class InventoryTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        User = get_user_model()
        self.user = User.objects.create_user(
            username='inventory_admin',
            password='TestPass123!'
        )

        UserProfile.objects.create(
            user=self.user,
            role='ADMIN'
        )

        self.client.force_authenticate(user=self.user)

        self.product = Product.objects.create(
            name='Test Product',
            sku='TEST-INV-001',
            category='Test',
            description='Inventory test product',
            price='100.00',
            unit='Piece',
            status='ACTIVE',
        )

        self.inventory = Inventory.objects.create(
            product=self.product,
            quantity=10,
            low_stock_threshold=5,
        )

    def test_add_stock(self):
        response = self.client.post(
            f'/api/inventory/{self.inventory.id}/add-stock/',
            {'quantity': 10},
            format='json'
        )

        self.assertEqual(response.status_code, 200)

        self.inventory.refresh_from_db()

        self.assertEqual(self.inventory.quantity, 20)

        self.assertTrue(
            InventoryHistory.objects.filter(
                inventory=self.inventory,
                transaction_type=InventoryHistory.STOCK_IN,
                quantity=10,
                previous_quantity=10,
                new_quantity=20,
            ).exists()
        )

    def test_reduce_stock(self):
        response = self.client.post(
            f'/api/inventory/{self.inventory.id}/reduce-stock/',
            {'quantity': 4},
            format='json'
        )

        self.assertEqual(response.status_code, 200)

        self.inventory.refresh_from_db()

        self.assertEqual(self.inventory.quantity, 6)

        self.assertTrue(
            InventoryHistory.objects.filter(
                inventory=self.inventory,
                transaction_type=InventoryHistory.STOCK_OUT,
                quantity=4,
                previous_quantity=10,
                new_quantity=6,
            ).exists()
        )

    def test_cannot_reduce_stock_below_zero(self):
        response = self.client.post(
            f'/api/inventory/{self.inventory.id}/reduce-stock/',
            {'quantity': 20},
            format='json'
        )

        self.assertEqual(response.status_code, 400)

        self.inventory.refresh_from_db()

        self.assertEqual(self.inventory.quantity, 10)

    def test_low_stock_status(self):
        self.inventory.quantity = 5
        self.inventory.save()

        self.assertEqual(
            self.inventory.status,
            'Low Stock'
        )

    def test_out_of_stock_status(self):
        self.inventory.quantity = 0
        self.inventory.save()

        self.assertEqual(
            self.inventory.status,
            'Out of Stock'
        )

    def test_in_stock_status(self):
        self.inventory.quantity = 10
        self.inventory.save()

        self.assertEqual(
            self.inventory.status,
            'In Stock'
        )

    def test_inventory_history_endpoint(self):
        self.client.post(
            f'/api/inventory/{self.inventory.id}/add-stock/',
            {'quantity': 5},
            format='json'
        )

        response = self.client.get(
            f'/api/inventory/{self.inventory.id}/history/'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]['transaction_type'],
            InventoryHistory.STOCK_IN
        )