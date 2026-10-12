from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    MeView,
    AdminTestView,
    ShopkeeperTestView,
    ProfileView,
    AdminUserListView,
    AdminUserDetailView,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),

    path('login/', TokenObtainPairView.as_view(), name='login'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('me/', MeView.as_view(), name='me'),

    path('admin-test/', AdminTestView.as_view(), name='admin_test'),

    path('shopkeeper-test/', ShopkeeperTestView.as_view(), name='shopkeeper_test'),

    path('profile/', ProfileView.as_view(), name='profile'),

   path("admin/users/", AdminUserListView.as_view(), name="admin_users"),
   path("admin/users/<int:pk>/", AdminUserDetailView.as_view(), name="admin_user_detail"),
]