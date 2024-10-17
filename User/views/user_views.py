from rest_framework import permissions, status
from rest_framework.response import Response
from User.models import CustomUser
from rest_framework import generics
from rest_framework.views import APIView
from User.auth.user_serializers import UserSerializer, OwnerSerializer
from User.permissions import IsShopOwner


class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.filter(is_user=True)
    serializer_class = UserSerializer
    permission_classes = [IsShopOwner]


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OwnerRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OwnerSerializer(data=request.data)
        if serializer.is_valid():
            owner = serializer.save()
            if owner:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
