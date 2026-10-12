from rest_framework import generics
from .serializers import RegisterSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import UserSerializer
from .permissions import IsAdmin, IsShopkeeper
from django.contrib.auth.models import User
from .serializers import AdminUserSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AdminTestView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            'message': 'Welcome Admin!',
            'username': request.user.username,
            'role': request.user.userprofile.role
        })


class ShopkeeperTestView(APIView):
    permission_classes = [IsAuthenticated, IsShopkeeper]

    def get(self, request):
        return Response({
            'message': 'Welcome Shopkeeper!',
            'username': request.user.username,
            'role': request.user.userprofile.role
        })

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.select_related("userprofile").order_by("id")


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.select_related("userprofile").order_by("id")
    http_method_names = ["get", "put", "patch", "head", "options"]
