from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Sum
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Component, Vehicle, Issue, Service, Invoice
from User.permissions import (
    IsVehicleOwner,
    IsShopOwner,
    IsOwnerOrReadOnly
)
from .serializers import (
    ComponentSerializer,
    VehicleSerializer,
    IssueSerializer,
    ServiceSerializer,
    InvoiceSerializer,
)


class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    permission_classes = [IsShopOwner]


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [IsVehicleOwner, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Vehicle.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [IsVehicleOwner]

    def get_queryset(self):
        return Issue.objects.filter(vehicle__owner=self.request.user)


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsShopOwner]

    def get_queryset(self):
        if self.request.user.is_shop_owner():
            return Service.objects.all()
        return Service.objects.filter(vehicle__owner=self.request.user)

    def perform_create(self, serializer):
        service = serializer.save()
        service.total_cost = serializer.calculate_service_cost(service)
        service.save()

    @action(detail=False, methods=['get'])
    def revenue_dashboard(self, request):
        if not request.user.is_shop_owner():
            return Response({"detail": "you do not have permission to perform this action"})
        today = timezone.now().date()
        daily_revenue = Service.objects.filter(date__date=today).aggregate(Sum('total_cost'))['total_cost__sum'] or 0
        monthly_revenue = Service.objects.filter(date__month=today.month, date__year=today.year).aggregate(Sum('total_cost'))['total_cost__sum'] or 0
        yearly_revenue = Service.objects.filter(date__year=today.year).aggregate(Sum('total_cos'))['total_cost__sum'] or 0

        return Response({
            "daily_revenue": daily_revenue,
            "monthly_revenue": monthly_revenue,
            "yearly_revenue": yearly_revenue,
        })


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_shop_owner():
            return Invoice.objects.all()
        return Invoice.objects.filter(service__vehicle__owner=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        if not request.user.is_shop_owner():
            return Response({"detail": "you do not have permission to perform this action"})
        invoice = self.get_object()
        invoice.paid = True
        invoice.save()
        return Response({"status": "invoice marked as paid"})

    @action(detail=False, methods=['get'])
    def unpaid(self, request):
        if not request.user.is_shop_owner():
            return Response({"detail": "you do not have permission to perform this action"})
        unpaid_invoices = self.get_queryset().filter(paid=False)
        serializer = self.get_serializer(unpaid_invoices, many=True)
        return Response(serializer.data)


def health_check(request):
    return JsonResponse({"status": "Health Check Ok"}, status=200)
