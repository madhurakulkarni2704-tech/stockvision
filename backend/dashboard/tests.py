from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from dashboard.views import DashboardView
from inventory.models import Inventory, InventoryHistory
from pricing.models import Pricing
from products.models import Product
from sales.models import Sale


class DashboardViewTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="dashboard_test_user",
            password="testpassword123",
        )

        self.product = Product.objects.create(
            name="Test Product",
            sku="DASH-001",
            category="Test",
            price=Decimal("100.00"),
            expiry_date=date.today() + timedelta(days=5),
            status="ACTIVE",
        )

        self.inventory = Inventory.objects.create(
            product=self.product,
            quantity=8,
            low_stock_threshold=10,
        )

        Pricing.objects.create(
            product=self.product,
            discount_percentage=10,
            discounted_price=Decimal("90.00"),
            is_applied=True,
        )

        self.factory = APIRequestFactory()

    # ============================================================
    # HELPERS
    # ============================================================

    def get_dashboard_response(self, period=None):
        if period is None:
            request = self.factory.get("/api/dashboard/")
        else:
            request = self.factory.get(
                f"/api/dashboard/?period={period}"
            )

        force_authenticate(request, self.user)

        response = DashboardView.as_view()(request)

        return response

    def create_sale(
        self,
        quantity,
        total_amount,
        days_ago=0,
    ):
        sale = Sale.objects.create(
            product=self.product,
            quantity=quantity,
            selling_price=Decimal("100.00"),
            total_amount=Decimal(total_amount),
        )

        if days_ago > 0:
            sale.sale_date = (
                timezone.now() - timedelta(days=days_ago)
            )
            sale.created_at = (
                timezone.now() - timedelta(days=days_ago)
            )

            sale.save(
                update_fields=[
                    "sale_date",
                    "created_at",
                ]
            )

        return sale

    def create_inventory_history(
        self,
        transaction_type,
        quantity,
        days_ago=0,
    ):
        if transaction_type == InventoryHistory.STOCK_IN:
            previous_quantity = max(
                0,
                self.inventory.quantity - quantity,
            )
            new_quantity = self.inventory.quantity
        else:
            previous_quantity = self.inventory.quantity + quantity
            new_quantity = self.inventory.quantity

        history = InventoryHistory.objects.create(
            inventory=self.inventory,
            transaction_type=transaction_type,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
        )

        if days_ago > 0:
            history.created_at = (
                timezone.now() - timedelta(days=days_ago)
            )

            history.save(
                update_fields=["created_at"]
            )

        return history

    # ============================================================
    # BASIC DASHBOARD TESTS
    # ============================================================

    def test_dashboard_returns_success(self):
        response = self.get_dashboard_response()

        self.assertEqual(response.status_code, 200)

    def test_dashboard_statistics(self):
        response = self.get_dashboard_response()

        statistics = response.data["statistics"]

        self.assertEqual(
            statistics["total_products"],
            1,
        )

        self.assertEqual(
            statistics["total_stock"],
            8,
        )

        self.assertEqual(
            statistics["low_stock_items"],
            1,
        )

        self.assertEqual(
            statistics["expiring_soon"],
            1,
        )

        self.assertEqual(
            statistics["expired_products"],
            0,
        )

        self.assertEqual(
            statistics["todays_sales"],
            0,
        )

        self.assertEqual(
            statistics["total_sales"],
            0,
        )

        self.assertEqual(
            statistics["active_discounts"],
            1,
        )

    def test_dashboard_sales_statistics(self):
        self.create_sale(
            quantity=2,
            total_amount="180.00",
        )

        response = self.get_dashboard_response()

        statistics = response.data["statistics"]

        self.assertEqual(
            statistics["todays_sales"],
            Decimal("180.00"),
        )

        self.assertEqual(
            statistics["total_sales"],
            Decimal("180.00"),
        )

    def test_dashboard_product_sales(self):
        self.create_sale(
            quantity=3,
            total_amount="300.00",
        )

        response = self.get_dashboard_response()

        product_sales = response.data["charts"]["product_sales"]

        self.assertEqual(
            len(product_sales),
            1,
        )

        self.assertEqual(
            product_sales[0]["product_id"],
            self.product.id,
        )

        self.assertEqual(
            product_sales[0]["product_name"],
            "Test Product",
        )

        self.assertEqual(
            product_sales[0]["quantity"],
            3,
        )

        self.assertEqual(
            product_sales[0]["total"],
            Decimal("300.00"),
        )

    def test_dashboard_stock_trends(self):
        self.create_inventory_history(
            transaction_type=InventoryHistory.STOCK_IN,
            quantity=5,
        )

        response = self.get_dashboard_response()

        stock_trends = response.data["charts"]["stock_trends"]

        self.assertEqual(
            len(stock_trends),
            1,
        )

        self.assertEqual(
            stock_trends[0]["stock_in"],
            5,
        )

        self.assertEqual(
            stock_trends[0]["stock_out"],
            0,
        )

    def test_dashboard_chart_keys_exist(self):
        response = self.get_dashboard_response()

        charts = response.data["charts"]

        self.assertIn(
            "daily_sales",
            charts,
        )

        self.assertIn(
            "weekly_sales",
            charts,
        )

        self.assertIn(
            "monthly_sales",
            charts,
        )

        self.assertIn(
            "product_sales",
            charts,
        )

        self.assertIn(
            "stock_trends",
            charts,
        )

        self.assertIn(
            "expiry_trends",
            charts,
        )

        self.assertIn(
            "discount_usage",
            charts,
        )

    # ============================================================
    # FILTER TESTS
    # ============================================================

    def test_dashboard_default_period_is_7_days(self):
        response = self.get_dashboard_response()

        self.assertEqual(
            response.status_code,
            200,
        )

        filters = response.data["filters"]

        self.assertEqual(
            filters["period"],
            "7",
        )

        self.assertEqual(
            filters["label"],
            "Last 7 Days",
        )

    def test_dashboard_30_day_filter_includes_recent_sales(self):
        self.create_sale(
            quantity=2,
            total_amount="200.00",
            days_ago=10,
        )

        response = self.get_dashboard_response(
            period="30"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        filters = response.data["filters"]

        self.assertEqual(
            filters["period"],
            "30",
        )

        self.assertEqual(
            filters["label"],
            "Last 30 Days",
        )

        product_sales = response.data["charts"]["product_sales"]

        self.assertEqual(
            len(product_sales),
            1,
        )

        self.assertEqual(
            product_sales[0]["quantity"],
            2,
        )

        self.assertEqual(
            product_sales[0]["total"],
            Decimal("200.00"),
        )

    def test_dashboard_7_day_filter_excludes_older_sales(self):
        self.create_sale(
            quantity=4,
            total_amount="400.00",
            days_ago=10,
        )

        response = self.get_dashboard_response(
            period="7"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        product_sales = response.data["charts"]["product_sales"]

        self.assertEqual(
            len(product_sales),
            0,
        )

    def test_dashboard_90_day_filter_includes_older_sale(self):
        self.create_sale(
            quantity=5,
            total_amount="500.00",
            days_ago=60,
        )

        response = self.get_dashboard_response(
            period="90"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        filters = response.data["filters"]

        self.assertEqual(
            filters["period"],
            "90",
        )

        self.assertEqual(
            filters["label"],
            "Last 90 Days",
        )

        product_sales = response.data["charts"]["product_sales"]

        self.assertEqual(
            len(product_sales),
            1,
        )

        self.assertEqual(
            product_sales[0]["quantity"],
            5,
        )

        self.assertEqual(
            product_sales[0]["total"],
            Decimal("500.00"),
        )

    def test_dashboard_365_day_filter_includes_old_sale(self):
        self.create_sale(
            quantity=6,
            total_amount="600.00",
            days_ago=200,
        )

        response = self.get_dashboard_response(
            period="365"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        filters = response.data["filters"]

        self.assertEqual(
            filters["period"],
            "365",
        )

        self.assertEqual(
            filters["label"],
            "Last 1 Year",
        )

        product_sales = response.data["charts"]["product_sales"]

        self.assertEqual(
            len(product_sales),
            1,
        )

        self.assertEqual(
            product_sales[0]["quantity"],
            6,
        )

        self.assertEqual(
            product_sales[0]["total"],
            Decimal("600.00"),
        )

    def test_dashboard_all_time_filter_includes_old_sale(self):
        self.create_sale(
            quantity=7,
            total_amount="700.00",
            days_ago=800,
        )

        response = self.get_dashboard_response(
            period="all"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        filters = response.data["filters"]

        self.assertEqual(
            filters["period"],
            "all",
        )

        self.assertEqual(
            filters["label"],
            "All Time",
        )

        product_sales = response.data["charts"]["product_sales"]

        self.assertEqual(
            len(product_sales),
            1,
        )

        self.assertEqual(
            product_sales[0]["quantity"],
            7,
        )

        self.assertEqual(
            product_sales[0]["total"],
            Decimal("700.00"),
        )

    def test_dashboard_invalid_period_falls_back_to_7_days(self):
        self.create_sale(
            quantity=8,
            total_amount="800.00",
            days_ago=10,
        )

        response = self.get_dashboard_response(
            period="invalid"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        filters = response.data["filters"]

        self.assertEqual(
            filters["period"],
            "7",
        )

        self.assertEqual(
            filters["label"],
            "Last 7 Days",
        )

        product_sales = response.data["charts"]["product_sales"]

        self.assertEqual(
            len(product_sales),
            0,
        )

    # ============================================================
    # AGGREGATION TESTS
    # ============================================================

    def test_dashboard_product_sales_aggregates_multiple_sales(self):
        self.create_sale(
            quantity=2,
            total_amount="200.00",
        )

        self.create_sale(
            quantity=3,
            total_amount="300.00",
        )

        response = self.get_dashboard_response(
            period="7"
        )

        product_sales = response.data["charts"]["product_sales"]

        self.assertEqual(
            len(product_sales),
            1,
        )

        self.assertEqual(
            product_sales[0]["quantity"],
            5,
        )

        self.assertEqual(
            product_sales[0]["total"],
            Decimal("500.00"),
        )

    def test_dashboard_stock_trends_filter_excludes_old_history(self):
        self.create_inventory_history(
            transaction_type=InventoryHistory.STOCK_IN,
            quantity=10,
            days_ago=10,
        )

        response = self.get_dashboard_response(
            period="7"
        )

        stock_trends = response.data["charts"]["stock_trends"]

        self.assertEqual(
            len(stock_trends),
            0,
        )

    def test_dashboard_stock_trends_filter_includes_recent_history(self):
        self.create_inventory_history(
            transaction_type=InventoryHistory.STOCK_IN,
            quantity=10,
            days_ago=2,
        )

        response = self.get_dashboard_response(
            period="7"
        )

        stock_trends = response.data["charts"]["stock_trends"]

        self.assertEqual(
            len(stock_trends),
            1,
        )

        self.assertEqual(
            stock_trends[0]["stock_in"],
            10,
        )

        self.assertEqual(
            stock_trends[0]["stock_out"],
            0,
        )

    def test_dashboard_stock_out_aggregation(self):
        self.create_inventory_history(
            transaction_type=InventoryHistory.STOCK_OUT,
            quantity=4,
        )

        response = self.get_dashboard_response(
            period="7"
        )

        stock_trends = response.data["charts"]["stock_trends"]

        self.assertEqual(
            len(stock_trends),
            1,
        )

        self.assertEqual(
            stock_trends[0]["stock_in"],
            0,
        )

        self.assertEqual(
            stock_trends[0]["stock_out"],
            4,
        )

    # ============================================================
    # FILTER METADATA TEST
    # ============================================================

    def test_dashboard_filter_contains_start_and_end_dates(self):
        response = self.get_dashboard_response(
            period="30"
        )

        filters = response.data["filters"]

        self.assertIn(
            "start_date",
            filters,
        )

        self.assertIn(
            "end_date",
            filters,
        )

        self.assertEqual(
            filters["end_date"],
            date.today(),
        )