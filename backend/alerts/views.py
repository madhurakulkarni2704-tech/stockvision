from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Alert
from .serializers import AlertSerializer
from .services import generate_all_alerts


class AlertListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        generate_all_alerts()

        alerts = Alert.objects.select_related(
            "product"
        ).filter(
            is_dismissed=False
        )

        read_filter = request.query_params.get("read")
        alert_type = request.query_params.get("type")

        if read_filter == "true":
            alerts = alerts.filter(is_read=True)

        elif read_filter == "false":
            alerts = alerts.filter(is_read=False)

        if alert_type:
            alerts = alerts.filter(
                alert_type=alert_type.upper()
            )

        serializer = AlertSerializer(
            alerts,
            many=True
        )

        return Response(serializer.data)


class AlertReadView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):

        try:
            alert = Alert.objects.get(pk=pk)

        except Alert.DoesNotExist:
            return Response(
                {"detail": "Alert not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        alert.is_read = True
        alert.save(update_fields=["is_read"])

        serializer = AlertSerializer(alert)

        return Response(serializer.data)

class AlertDeleteView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            alert = Alert.objects.get(pk=pk)
        except Alert.DoesNotExist:
            return Response(
                {"detail": "Alert not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        alert.is_dismissed = True
        alert.save(update_fields=["is_dismissed"])

        return Response(
            {"detail": "Alert dismissed successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )