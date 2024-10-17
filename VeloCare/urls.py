from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import ComponentViewSet, VehicleViewSet, IssueViewSet, InvoiceViewSet, ServiceViewSet, AllIssueViewSet


router = DefaultRouter()
router.register(r"components", ComponentViewSet, basename='components')
router.register(r"vehicles", VehicleViewSet, basename='vehicles')
router.register(r"all_issues", AllIssueViewSet, basename='all_issues')
router.register(r"services", ServiceViewSet, basename='services')

vehicle_router = routers.NestedDefaultRouter(router, r"vehicles", lookup="vehicle")
vehicle_router.register(r"issues", IssueViewSet, basename='vehicle_issues')

service_router = routers.NestedDefaultRouter(router, r"services", lookup="service")
service_router.register(r"invoices", InvoiceViewSet, basename='service_invoices')


urlpatterns = [
    path("", include(router.urls)),
    path("", include(vehicle_router.urls)),
    path("", include(service_router.urls))
]
