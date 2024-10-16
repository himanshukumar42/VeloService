from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import Token
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class UserTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user) -> Token:
        if not user.is_user:
            raise AuthenticationFailed("user is not register as user")
        token = super().get_token(user)
        token['user_type'] = 'vehicle_owner'
        return token


class OwnerTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user) -> Token:
        if not user.is_owner:
            raise AuthenticationFailed("user is not register as shop owner")
        token = super().get_token(user)
        token['user_type'] = 'shop_owner'
        return token
