from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import UserProfile
from inventory.models import Inventory
from products.models import Product


class ProductInventoryIntegrationTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()

        User = get_user_model()

        self.user = User.objects.create_user(
            username='product_inventory_admin',
            password='TestPass123!'
        )

        UserProfile.objects.create(
            user=self.user,
            role='ADMIN'
        )

        self.client.force_authenticate(
            user=self.user
        )

    def test_product_api_creation_automatically_creates_inventory(self):
        response = self.client.post(
            '/api/products/',
            {
                'name': 'Automatic Inventory Product',
                'sku': 'AUTO-INV-001',
                'category': 'Test',
                'description': 'Product inventory integration test',
                'price': '150.00',
                'unit': 'Piece',
                'status': 'ACTIVE',
                'expiry_date': '2027-01-01',
            },
            format='json'
        )

        self.assertEqual(response.status_code, 201)

        product = Product.objects.get(
            sku='AUTO-INV-001'
        )

        inventory = Inventory.objects.get(
            product=product
        )

        self.assertEqual(inventory.quantity, 0)

        self.assertEqual(
            inventory.low_stock_threshold,
            10
        )

    def test_product_api_creation_creates_only_one_inventory(self):
        response = self.client.post(
            '/api/products/',
            {
                'name': 'Single Inventory Product',
                'sku': 'AUTO-INV-002',
                'category': 'Test',
                'description': 'Single inventory integration test',
                'price': '200.00',
                'unit': 'Piece',
                'status': 'ACTIVE',
                'expiry_date': '2027-02-01',
            },
            format='json'
        )

        self.assertEqual(response.status_code, 201)

        product = Product.objects.get(
            sku='AUTO-INV-002'
        )

        self.assertEqual(
            Inventory.objects.filter(
                product=product
            ).count(),
            1
        )