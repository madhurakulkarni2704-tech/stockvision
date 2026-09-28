from rest_framework.permissions import BasePermission


class InventoryPermission(BasePermission):

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        try:
            role = request.user.userprofile.role
        except Exception:
            return False

        if role == "ADMIN":
            return True

        if role == "SHOPKEEPER":
            return request.method in ["GET", "HEAD", "OPTIONS"]

        return False