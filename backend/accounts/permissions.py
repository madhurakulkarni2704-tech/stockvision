from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Allows access only to users with ADMIN role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'userprofile')
            and request.user.userprofile.role == 'ADMIN'
        )


class IsShopkeeper(BasePermission):
    """
    Allows access only to users with SHOPKEEPER role.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'userprofile')
            and request.user.userprofile.role == 'SHOPKEEPER'
        )