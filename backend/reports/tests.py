from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from inventory.models import Inventory
from pricing.models import Pricing
from products.models import Product
from sales.models import Sale

from .services import (
    export_sales_csv,
    export_sales_excel,
    export_sales_pdf,
)


class ReportsAPITestCase(APITestCase):

    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="reports_test_user",
            password="testpassword123",
        )

        self.client.force_authenticate(user=self.user)

        self.product = Product.objects.create(
            name="Milk",
            sku="MILK-001",
            category="Dairy",
            price=Decimal("40.00"),
        )

        self.product_two = Product.objects.create(
            name="Bread",
            sku="BREAD-001",
            category="Bakery",
            price=Decimal("50.00"),
        )

        self.inventory = Inventory.objects.create(
            product=self.product,
            quantity=20,
            low_stock_threshold=5,
        )

        self.inventory_two = Inventory.objects.create(
            product=self.product_two,
            quantity=3,
            low_stock_threshold=5,
        )

        self.sale = Sale.objects.create(
            product=self.product,
            quantity=10,
            selling_price=Decimal("40.00"),
            total_amount=Decimal("400.00"),
        )

        self.sale_two = Sale.objects.create(
            product=self.product_two,
            quantity=5,
            selling_price=Decimal("50.00"),
            total_amount=Decimal("250.00"),
        )

        self.sales_url = reverse("sales-report")
        self.sales_csv_url = reverse("sales-report-csv")
        self.sales_excel_url = reverse("sales-report-excel")
        self.sales_pdf_url = reverse("sales-report-pdf")

        self.inventory_url = reverse("inventory-report")
        self.expiry_url = reverse("expiry-report")
        self.low_stock_url = reverse("low-stock-report")
        self.discount_url = reverse("discount-report")

    def test_sales_report_returns_sales_and_summary(self):
        response = self.client.get(self.sales_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["report"]),
            2,
        )

        self.assertEqual(
            response.data["summary"]["total_quantity"],
            15,
        )

        self.assertEqual(
            Decimal(str(response.data["summary"]["total_amount"])),
            Decimal("650.00"),
        )

        self.assertEqual(
            response.data["summary"]["total_sales"],
            2,
        )

    def test_sales_report_filters_by_product(self):
        response = self.client.get(
            self.sales_url,
            {
                "product_id": self.product.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["report"]),
            1,
        )

        self.assertEqual(
            response.data["report"][0]["product"],
            "Milk",
        )

        self.assertEqual(
            response.data["summary"]["total_quantity"],
            10,
        )

        self.assertEqual(
            Decimal(str(response.data["summary"]["total_amount"])),
            Decimal("400.00"),
        )

    def test_sales_report_filters_by_date(self):
        sale_date = self.sale.sale_date

        response = self.client.get(
            self.sales_url,
            {
                "start_date": sale_date.strftime("%Y-%m-%d"),
                "end_date": sale_date.strftime("%Y-%m-%d"),
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["report"]),
            2,
        )

    def test_inventory_report(self):
        response = self.client.get(self.inventory_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["report"]),
            2,
        )

    def test_inventory_report_filters_by_product(self):
        response = self.client.get(
            self.inventory_url,
            {
                "product_id": self.product.id,
            },
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["report"]),
            1,
        )

        self.assertEqual(
            response.data["report"][0]["product"],
            "Milk",
        )

    def test_expiry_report(self):
        response = self.client.get(self.expiry_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn(
            "report",
            response.data,
        )

    def test_low_stock_report(self):
        response = self.client.get(self.low_stock_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["report"]),
            1,
        )

        self.assertEqual(
            response.data["report"][0]["product"],
            "Bread",
        )

        self.assertEqual(
            response.data["report"][0]["quantity"],
            3,
        )

    def test_discount_report(self):
        Pricing.objects.create(
            product=self.product,
            discount_percentage=Decimal("10.00"),
            discounted_price=Decimal("36.00"),
            is_applied=True,
        )

        response = self.client.get(self.discount_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data["report"]),
            1,
        )

        self.assertEqual(
            response.data["report"][0]["product"],
            "Milk",
        )

    def test_sales_csv_export(self):
        sales = Sale.objects.select_related("product").all()

        csv_data = export_sales_csv(sales)

        self.assertIn(
            "Date,Product,SKU,Quantity,Selling Price,Amount",
            csv_data,
        )

        self.assertIn(
            "Milk",
            csv_data,
        )

        self.assertIn(
            "MILK-001",
            csv_data,
        )

    def test_sales_excel_export(self):
        sales = Sale.objects.select_related("product").all()

        excel_file = export_sales_excel(sales)

        self.assertGreater(
            len(excel_file.getvalue()),
            0,
        )

    def test_sales_pdf_export(self):
        sales = Sale.objects.select_related("product").all()

        pdf_file = export_sales_pdf(sales)

        self.assertGreater(
            len(pdf_file.getvalue()),
            0,
        )

    def test_sales_csv_export_endpoint(self):
        response = self.client.get(self.sales_csv_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response["Content-Type"],
            "text/csv",
        )

        self.assertIn(
            'attachment; filename="sales_report.csv"',
            response["Content-Disposition"],
        )

        self.assertIn(
            "Milk",
            response.content.decode("utf-8"),
        )

    def test_sales_excel_export_endpoint(self):
        response = self.client.get(self.sales_excel_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response["Content-Type"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

        self.assertIn(
            'attachment; filename="sales_report.xlsx"',
            response["Content-Disposition"],
        )

        self.assertGreater(
            len(response.content),
            0,
        )

    def test_sales_pdf_export_endpoint(self):
        response = self.client.get(self.sales_pdf_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response["Content-Type"],
            "application/pdf",
        )

        self.assertIn(
            'attachment; filename="sales_report.pdf"',
            response["Content-Disposition"],
        )

        self.assertGreater(
            len(response.content),
            0,
        )