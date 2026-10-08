import csv
from io import BytesIO, StringIO

from django.db.models import Sum, Count, F, DecimalField
from django.db.models.functions import Coalesce

from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle

from sales.models import Sale
from products.models import Product
from inventory.models import Inventory
from pricing.models import Pricing


def get_sales_report(start_date=None, end_date=None, product_id=None):
    sales = Sale.objects.select_related("product").all()

    if start_date:
        sales = sales.filter(sale_date__gte=start_date)

    if end_date:
        sales = sales.filter(
            sale_date__date__lte=end_date
    )

    if product_id:
        sales = sales.filter(product_id=product_id)

    return sales.order_by("-sale_date", "-id")


def get_sales_summary(start_date=None, end_date=None, product_id=None):
    sales = get_sales_report(start_date, end_date, product_id)

    summary = sales.aggregate(
        total_quantity=Coalesce(Sum("quantity"), 0),
        total_amount=Coalesce(
            Sum("total_amount"),
            0,
            output_field=DecimalField(
                max_digits=12,
                decimal_places=2,
            ),
        ),
        total_sales=Count("id"),
    )

    return summary


def get_inventory_report(product_id=None):
    inventory = Inventory.objects.select_related("product").all()

    if product_id:
        inventory = inventory.filter(product_id=product_id)

    return inventory.order_by("product__name")


def get_expiry_report(product_id=None):
    products = Product.objects.all()

    if product_id:
        products = products.filter(id=product_id)

    return products.filter(
        expiry_date__isnull=False
    ).order_by("expiry_date", "name")


def get_low_stock_report(product_id=None):
    inventory = Inventory.objects.select_related("product").filter(
        quantity__lte=F("low_stock_threshold")
    )

    if product_id:
        inventory = inventory.filter(product_id=product_id)

    return inventory.order_by(
        "quantity",
        "product__name",
    )


def get_discount_report(product_id=None):
    pricing = Pricing.objects.select_related("product").filter(
        is_applied=True
    )

    if product_id:
        pricing = pricing.filter(product_id=product_id)

    return pricing.order_by(
        "-discount_percentage",
        "product__name",
    )


def export_sales_csv(sales):
    output = StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Date",
        "Product",
        "SKU",
        "Quantity",
        "Selling Price",
        "Amount",
    ])

    for sale in sales:
        writer.writerow([
            sale.sale_date,
            sale.product.name,
            sale.product.sku,
            sale.quantity,
            sale.selling_price,
            sale.total_amount,
        ])

    return output.getvalue()


def export_sales_excel(sales):
    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "Sales Report"

    headers = [
        "Date",
        "Product",
        "SKU",
        "Quantity",
        "Selling Price",
        "Amount",
    ]

    worksheet.append(headers)

    for sale in sales:
        sale_date = sale.sale_date

        if hasattr(sale_date, "tzinfo") and sale_date.tzinfo is not None:
            sale_date = sale_date.replace(tzinfo=None)

        worksheet.append([
            sale_date,
            sale.product.name,
            sale.product.sku,
            sale.quantity,
            sale.selling_price,
            sale.total_amount,
        ])

    for column in worksheet.columns:
        max_length = 0
        column_letter = column[0].column_letter

        for cell in column:
            value = str(cell.value) if cell.value is not None else ""
            max_length = max(max_length, len(value))

        worksheet.column_dimensions[column_letter].width = (
            max_length + 2
        )

    output = BytesIO()

    workbook.save(output)

    output.seek(0)

    return output


def export_sales_pdf(sales):
    output = BytesIO()

    document = SimpleDocTemplate(
        output,
        pagesize=landscape(A4),
    )

    data = [
        [
            "Date",
            "Product",
            "SKU",
            "Quantity",
            "Selling Price",
            "Amount",
        ]
    ]

    for sale in sales:
        data.append([
            str(sale.sale_date),
            sale.product.name,
            sale.product.sku,
            sale.quantity,
            sale.selling_price,
            sale.total_amount,
        ])

    table = Table(data)

    table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.grey,
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white,
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                1,
                colors.black,
            ),
            (
                "ALIGN",
                (3, 1),
                (3, -1),
                "CENTER",
            ),
            (
                "ALIGN",
                (4, 1),
                (5, -1),
                "RIGHT",
            ),
            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold",
            ),
        ])
    )

    document.build([table])

    output.seek(0)

    return output