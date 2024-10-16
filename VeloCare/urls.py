from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComponentViewSet, VehicleViewSet, IssueViewSet, InvoiceViewSet


router = DefaultRouter()
router.register(r"components", ComponentViewSet, basename='components')
router.register(r"vehicles", VehicleViewSet, basename='vehicles')
router.register(r"issues", IssueViewSet, basename='issues')
router.register(r"invoices", InvoiceViewSet, basename='invoices')

urlpatterns = [path("", include(router.urls))]
