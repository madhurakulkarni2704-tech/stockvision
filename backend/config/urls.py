"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication APIs
    path('api/auth/', include('accounts.urls')),

    # Product APIs
    path('api/products/', include('products.urls')),

    # Inventory APIs
    path('api/inventory/', include('inventory.urls')),

    # Expiry Monitoring APIs
    path('api/expiry/', include('expiry.urls')),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )