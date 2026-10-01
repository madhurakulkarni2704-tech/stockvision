from django.urls import path

from .views import (
    AlertDeleteView,
    AlertListView,
    AlertReadView,
)


urlpatterns = [
    path("", AlertListView.as_view(), name="alert-list"),
    path(
        "<int:pk>/read/",
        AlertReadView.as_view(),
        name="alert-read",
    ),
    path(
        "<int:pk>/",
        AlertDeleteView.as_view(),
        name="alert-delete",
    ),
]