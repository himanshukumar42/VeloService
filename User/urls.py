from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from User.views.user_views import UserRegistrationView, OwnerRegistrationView, UserListView
from User.views.auth_views import UserTokenObtainPairView, OwnerTokenObtainPairView


urlpatterns = [
    path("", UserListView.as_view(), name='user_list'),
    path("register/", UserRegistrationView.as_view(), name='user_register'),
    path("owner/register/", OwnerRegistrationView.as_view(), name='owner_register'),
    path("token/", UserTokenObtainPairView.as_view(), name='user_token_obtain_pair'),
    path("owner/token", OwnerTokenObtainPairView.as_view(), name='owner_token_obtain_pair'),
    path("token/refresh", TokenRefreshView.as_view(), name='token_refresh'),
]
