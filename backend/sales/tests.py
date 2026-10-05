from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from inventory.models import Inventory, InventoryHistory
from products.models import Product

from .models import Sale


class SaleAPITestCase(APITestCase):

    def setUp(self):
        self.product = Product.objects.create(
            name='Milk',
            sku='MILK-001',
            category='Dairy',
            price=Decimal('40.00'),
        )

        self.inventory = Inventory.objects.create(
            product=self.product,
            quantity=20,
            low_stock_threshold=5,
        )

        self.sales_url = reverse('sale-list')

    def test_create_sale_calculates_total_and_reduces_stock(self):
        response = self.client.post(
            self.sales_url,
            {
                'product': self.product.id,
                'quantity': 2,
                'selling_price': '40.00',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        sale = Sale.objects.get()

        self.assertEqual(
            sale.quantity,
            2
        )

        self.assertEqual(
            sale.selling_price,
            Decimal('40.00')
        )

        self.assertEqual(
            sale.total_amount,
            Decimal('80.00')
        )

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity,
            18
        )

    def test_create_sale_creates_inventory_history(self):
        response = self.client.post(
            self.sales_url,
            {
                'product': self.product.id,
                'quantity': 2,
                'selling_price': '40.00',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        history = InventoryHistory.objects.get()

        self.assertEqual(
            history.transaction_type,
            InventoryHistory.STOCK_OUT
        )

        self.assertEqual(
            history.quantity,
            2
        )

        self.assertEqual(
            history.previous_quantity,
            20
        )

        self.assertEqual(
            history.new_quantity,
            18
        )

    def test_sale_rejected_when_stock_is_insufficient(self):
        response = self.client.post(
            self.sales_url,
            {
                'product': self.product.id,
                'quantity': 21,
                'selling_price': '40.00',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            Sale.objects.count(),
            0
        )

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity,
            20
        )

    def test_sale_rejected_when_quantity_is_zero(self):
        response = self.client.post(
            self.sales_url,
            {
                'product': self.product.id,
                'quantity': 0,
                'selling_price': '40.00',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            Sale.objects.count(),
            0
        )

    def test_sale_rejected_when_selling_price_is_zero(self):
        response = self.client.post(
            self.sales_url,
            {
                'product': self.product.id,
                'quantity': 2,
                'selling_price': '0.00',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            Sale.objects.count(),
            0
        )

    def test_list_sales(self):
        Sale.objects.create(
            product=self.product,
            quantity=2,
            selling_price=Decimal('40.00'),
            total_amount=Decimal('80.00'),
        )

        response = self.client.get(self.sales_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )

        self.assertEqual(
            response.data[0]['product_name'],
            'Milk'
        )

    def test_retrieve_sale(self):
        sale = Sale.objects.create(
            product=self.product,
            quantity=2,
            selling_price=Decimal('40.00'),
            total_amount=Decimal('80.00'),
        )

        response = self.client.get(
            reverse(
                'sale-detail',
                args=[sale.id]
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data['quantity'],
            2
        )

        self.assertEqual(
            response.data['total_amount'],
            '80.00'
        )