from django.urls import path

from .views import (
    ExpiredView,
    ExpiryListView,
    ExpiringSoonView,
    SafeProductsView,
)


urlpatterns = [
    path("", ExpiryListView.as_view(), name="expiry-list"),
    path(
        "expiring-soon/",
        ExpiringSoonView.as_view(),
        name="expiry-expiring-soon",
    ),
    path(
        "expired/",
        ExpiredView.as_view(),
        name="expiry-expired",
    ),
    path(
        "safe/",
        SafeProductsView.as_view(),
        name="expiry-safe",
    ),
]