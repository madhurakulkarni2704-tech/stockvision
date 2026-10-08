from django.urls import path

from .views import (
    sales_report,
    sales_report_csv,
    sales_report_excel,
    sales_report_pdf,
    inventory_report,
    expiry_report,
    low_stock_report,
    discount_report,
)


urlpatterns = [
    path("sales/", sales_report, name="sales-report"),
    path("sales/export/csv/", sales_report_csv, name="sales-report-csv"),
    path("sales/export/excel/", sales_report_excel, name="sales-report-excel"),
    path("sales/export/pdf/", sales_report_pdf, name="sales-report-pdf"),
    path("inventory/", inventory_report, name="inventory-report"),
    path("expiry/", expiry_report, name="expiry-report"),
    path("low-stock/", low_stock_report, name="low-stock-report"),
    path("discount/", discount_report, name="discount-report"),
]