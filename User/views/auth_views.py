from rest_framework_simplejwt.views import TokenObtainPairView
from User.auth.auth_serializer import UserTokenObtainPairSerializer, OwnerTokenObtainPairSerializer


class UserTokenObtainPairView(TokenObtainPairView):
    serializer_class = UserTokenObtainPairSerializer


class OwnerTokenObtainPairView(TokenObtainPairView):
    serializer_class = OwnerTokenObtainPairSerializer
