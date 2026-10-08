from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse

from .services import (
    get_sales_report,
    get_sales_summary,
    get_inventory_report,
    get_expiry_report,
    get_low_stock_report,
    get_discount_report,
    export_sales_csv,
    export_sales_excel,
    export_sales_pdf,
)


def parse_product_id(value):
    if not value:
        return None

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sales_report(request):
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    product_id = parse_product_id(request.GET.get("product_id"))

    sales = get_sales_report(
        start_date=start_date,
        end_date=end_date,
        product_id=product_id,
    )

    summary = get_sales_summary(
        start_date=start_date,
        end_date=end_date,
        product_id=product_id,
    )

    data = [
        {
            "id": sale.id,
            "date": sale.sale_date,
            "product_id": sale.product_id,
            "product": sale.product.name,
            "quantity": sale.quantity,
            "selling_price": sale.selling_price,
            "total_amount": sale.total_amount,
        }
        for sale in sales
    ]

    return Response(
        {
            "report": data,
            "summary": summary,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sales_report_csv(request):
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    product_id = parse_product_id(request.GET.get("product_id"))

    sales = get_sales_report(
        start_date=start_date,
        end_date=end_date,
        product_id=product_id,
    )

    csv_data = export_sales_csv(sales)

    response = HttpResponse(
        csv_data,
        content_type="text/csv",
    )

    response["Content-Disposition"] = (
        'attachment; filename="sales_report.csv"'
    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sales_report_excel(request):
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    product_id = parse_product_id(request.GET.get("product_id"))

    sales = get_sales_report(
        start_date=start_date,
        end_date=end_date,
        product_id=product_id,
    )

    excel_file = export_sales_excel(sales)

    response = HttpResponse(
        excel_file.getvalue(),
        content_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
    )

    response["Content-Disposition"] = (
        'attachment; filename="sales_report.xlsx"'
    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sales_report_pdf(request):
    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")
    product_id = parse_product_id(request.GET.get("product_id"))

    sales = get_sales_report(
        start_date=start_date,
        end_date=end_date,
        product_id=product_id,
    )

    pdf_file = export_sales_pdf(sales)

    response = HttpResponse(
        pdf_file.getvalue(),
        content_type="application/pdf",
    )

    response["Content-Disposition"] = (
        'attachment; filename="sales_report.pdf"'
    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def inventory_report(request):
    product_id = parse_product_id(request.GET.get("product_id"))

    inventory = get_inventory_report(product_id=product_id)

    data = [
        {
            "id": item.id,
            "product_id": item.product_id,
            "product": item.product.name,
            "sku": item.product.sku,
            "quantity": item.quantity,
            "low_stock_threshold": item.low_stock_threshold,
            "updated_at": item.updated_at,
        }
        for item in inventory
    ]

    return Response({"report": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def expiry_report(request):
    product_id = parse_product_id(request.GET.get("product_id"))

    products = get_expiry_report(product_id=product_id)

    data = [
        {
            "id": product.id,
            "product": product.name,
            "sku": product.sku,
            "expiry_date": product.expiry_date,
            "status": product.status,
        }
        for product in products
    ]

    return Response({"report": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def low_stock_report(request):
    product_id = parse_product_id(request.GET.get("product_id"))

    inventory = get_low_stock_report(product_id=product_id)

    data = [
        {
            "id": item.id,
            "product_id": item.product_id,
            "product": item.product.name,
            "sku": item.product.sku,
            "quantity": item.quantity,
            "low_stock_threshold": item.low_stock_threshold,
        }
        for item in inventory
    ]

    return Response({"report": data})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def discount_report(request):
    product_id = parse_product_id(request.GET.get("product_id"))

    pricing = get_discount_report(product_id=product_id)

    data = [
        {
            "id": item.id,
            "product_id": item.product_id,
            "product": item.product.name,
            "sku": item.product.sku,
            "discount_percentage": item.discount_percentage,
            "discounted_price": item.discounted_price,
            "is_applied": item.is_applied,
        }
        for item in pricing
    ]

    return Response({"report": data})