
from datetime import date, timedelta

from django.db.models import F, Q, Sum
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from expiry.services import (
    get_expired_products,
    get_expiring_soon_products,
)
from inventory.models import Inventory, InventoryHistory
from pricing.models import Pricing
from products.models import Product
from sales.models import Sale


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = date.today()

        # =========================================================
        # DASHBOARD ANALYTICS FILTER
        # =========================================================

        period = request.query_params.get("period", "7")

        allowed_periods = {
            "7": 7,
            "30": 30,
            "90": 90,
            "365": 365,
            "all": None,
        }

        if period not in allowed_periods:
            period = "7"

        period_days = allowed_periods[period]

        if period_days is None:
            analytics_start_date = None
        else:
            analytics_start_date = today - timedelta(
                days=period_days - 1
            )

        # =========================================================
        # DASHBOARD STATISTICS
        # =========================================================

        total_products = Product.objects.count()

        total_stock = (
            Inventory.objects.aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )

        low_stock_items = Inventory.objects.filter(
            quantity__lte=F("low_stock_threshold")
        ).count()

        expiring_soon = get_expiring_soon_products().count()
        expired_products = get_expired_products().count()

        total_sales = (
            Sale.objects.aggregate(
                total=Sum("total_amount")
            )["total"]
            or 0
        )

        todays_sales = (
            Sale.objects.filter(
                sale_date__date=today
            ).aggregate(
                total=Sum("total_amount")
            )["total"]
            or 0
        )

        active_discounts = Pricing.objects.filter(
            is_applied=True,
            discount_percentage__gt=0,
        ).count()

        # =========================================================
        # FILTERED SALES QUERYSET
        # =========================================================

        sales_queryset = Sale.objects.all()

        if analytics_start_date is not None:
            sales_queryset = sales_queryset.filter(
                sale_date__date__gte=analytics_start_date,
                sale_date__date__lte=today,
            )

        # =========================================================
        # DAILY SALES
        # =========================================================

        daily_sales_queryset = (
            sales_queryset
            .annotate(day=TruncDate("sale_date"))
            .values("day")
            .annotate(total=Sum("total_amount"))
            .order_by("day")
        )

        daily_sales = [
            {
                "date": item["day"],
                "total": item["total"],
            }
            for item in daily_sales_queryset
        ]

        # =========================================================
        # WEEKLY SALES
        # =========================================================

        weekly_sales_queryset = (
            sales_queryset
            .annotate(week=TruncWeek("sale_date"))
            .values("week")
            .annotate(total=Sum("total_amount"))
            .order_by("week")
        )

        weekly_sales = [
            {
                "week": item["week"],
                "total": item["total"],
            }
            for item in weekly_sales_queryset
        ]

        # =========================================================
        # MONTHLY SALES
        # =========================================================

        monthly_sales_queryset = (
            sales_queryset
            .annotate(month=TruncMonth("sale_date"))
            .values("month")
            .annotate(total=Sum("total_amount"))
            .order_by("month")
        )

        monthly_sales = [
            {
                "month": item["month"],
                "total": item["total"],
            }
            for item in monthly_sales_queryset
        ]

        # =========================================================
        # PRODUCT SALES
        # =========================================================

        product_sales_queryset = (
            sales_queryset
            .values(
                "product_id",
                "product__name",
            )
            .annotate(
                quantity=Sum("quantity"),
                total=Sum("total_amount"),
            )
            .order_by("-total")
        )

        product_sales = [
            {
                "product_id": item["product_id"],
                "product_name": item["product__name"],
                "quantity": item["quantity"],
                "total": item["total"],
            }
            for item in product_sales_queryset
        ]

        # =========================================================
        # STOCK TRENDS
        # =========================================================

        stock_history_queryset = InventoryHistory.objects.all()

        if analytics_start_date is not None:
            stock_history_queryset = stock_history_queryset.filter(
                created_at__date__gte=analytics_start_date,
                created_at__date__lte=today,
            )

        stock_history_queryset = (
            stock_history_queryset
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(
                stock_in=Sum(
                    "quantity",
                    filter=Q(
                        transaction_type=InventoryHistory.STOCK_IN
                    ),
                ),
                stock_out=Sum(
                    "quantity",
                    filter=Q(
                        transaction_type=InventoryHistory.STOCK_OUT
                    ),
                ),
            )
            .order_by("day")
        )

        stock_trends = [
            {
                "date": item["day"],
                "stock_in": item["stock_in"] or 0,
                "stock_out": item["stock_out"] or 0,
            }
            for item in stock_history_queryset
        ]

        # =========================================================
        # EXPIRY TRENDS
        # =========================================================

        expiry_trends = [
            {
                "status": "SAFE",
                "count": Product.objects.filter(
                    expiry_date__gt=today + timedelta(days=7)
                ).count(),
            },
            {
                "status": "EXPIRING SOON",
                "count": expiring_soon,
            },
            {
                "status": "EXPIRED",
                "count": expired_products,
            },
        ]

        # =========================================================
        # DISCOUNT OVERVIEW
        # =========================================================

        discount_usage = (
            Pricing.objects.filter(
                discount_percentage__gt=0,
            )
            .values(
                "discount_percentage",
                "is_applied",
            )
            .annotate(
                product_count=Sum(
                    "product__inventory__quantity"
                )
            )
            .order_by("-discount_percentage")
        )

        discount_usage_data = [
            {
                "discount_percentage": item["discount_percentage"],
                "is_applied": item["is_applied"],
                "product_count": item["product_count"] or 0,
            }
            for item in discount_usage
        ]

        # =========================================================
        # LOW STOCK TABLE
        # =========================================================

        low_stock_queryset = (
            Inventory.objects
            .filter(quantity__lte=F("low_stock_threshold"))
            .select_related("product")
            .order_by("quantity")
        )

        low_stock_data = [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name,
                "sku": item.product.sku,
                "quantity": item.quantity,
                "low_stock_threshold": item.low_stock_threshold,
            }
            for item in low_stock_queryset
        ]

        # =========================================================
        # EXPIRING SOON TABLE
        # =========================================================

        expiring_soon_queryset = (
            get_expiring_soon_products()
            .order_by("expiry_date")
        )

        expiring_soon_data = [
            {
                "id": product.id,
                "product_id": product.id,
                "product_name": product.name,
                "sku": product.sku,
                "expiry_date": product.expiry_date,
                "days_remaining": (
                    product.expiry_date - today
                ).days,
            }
            for product in expiring_soon_queryset
        ]

        # =========================================================
        # RECENT SALES TABLE
        # =========================================================

        recent_sales_queryset = (
            Sale.objects
            .select_related("product")
            .order_by("-sale_date")[:5]
        )

        recent_sales_data = [
            {
                "id": sale.id,
                "product_name": sale.product.name,
                "quantity": sale.quantity,
                "selling_price": sale.selling_price,
                "total_amount": sale.total_amount,
                "sale_date": sale.sale_date,
            }
            for sale in recent_sales_queryset
        ]

        # =========================================================
        # FILTER INFORMATION
        # =========================================================

        period_labels = {
            "7": "Last 7 Days",
            "30": "Last 30 Days",
            "90": "Last 90 Days",
            "365": "Last 1 Year",
            "all": "All Time",
        }

        # =========================================================
        # RESPONSE
        # =========================================================

        return Response(
            {
                "filters": {
                    "period": period,
                    "label": period_labels[period],
                    "start_date": analytics_start_date,
                    "end_date": today,
                },
                "statistics": {
                    "total_products": total_products,
                    "total_stock": total_stock,
                    "low_stock_items": low_stock_items,
                    "expiring_soon": expiring_soon,
                    "expired_products": expired_products,
                    "todays_sales": todays_sales,
                    "total_sales": total_sales,
                    "active_discounts": active_discounts,
                },
                "charts": {
                    "daily_sales": daily_sales,
                    "weekly_sales": weekly_sales,
                    "monthly_sales": monthly_sales,
                    "product_sales": product_sales,
                    "stock_trends": stock_trends,
                    "expiry_trends": expiry_trends,
                    "discount_usage": discount_usage_data,
                },
                "tables": {
                    "low_stock": low_stock_data,
                    "expiring_soon": expiring_soon_data,
                    "recent_sales": recent_sales_data,
                },
            }
        )

