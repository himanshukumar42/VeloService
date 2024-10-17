from django.http import JsonResponse
from rest_framework import status
from django.shortcuts import get_object_or_404
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
    permission_classes = [IsVehicleOwner, IsShopOwner]

    def get_queryset(self):
        return Vehicle.objects.select_related('owner').all()

    def perform_create(self, serializer):
        serializer.save()


class AllIssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [IsVehicleOwner, IsShopOwner]

    def get_queryset(self):
        return Issue.objects.select_related('vehicle').prefetch_related('component')


class IssueViewSet(viewsets.ModelViewSet):
    serializer_class = IssueSerializer
    permission_classes = [IsVehicleOwner, IsShopOwner]

    def get_queryset(self):
        vehicle_id = self.kwargs.get('vehicle_pk')
        return Issue.objects.filter(vehicle_id=vehicle_id).select_related('vehicle').prefetch_related('component')

    def perform_create(self, serializer):
        vehicle_id = self.kwargs.get('vehicle_pk')
        vehicle = get_object_or_404(Vehicle, pk=vehicle_id)
        serializer.save(vehicle=vehicle)

    def perform_update(self, serializer):
        try:
            vehicle_id = self.kwargs.get('vehicle_pk')
            issue_id = self.kwargs.get('pk')

            issue = get_object_or_404(Issue, pk=issue_id, vehicle_id=vehicle_id)
            self.check_object_permissions(self.request, issue)

            serializer = self.get_serializer(issue, data=self.request.data, partial=True)
            serializer.is_valid(raise_exception=True,)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response({'error': 'An error occurred during the update.'}, status=status.HTTP_400_BAD_REQUEST)

    def perform_destroy(self, instance):
        instance.delete()


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsShopOwner]

    def get_queryset(self):
        if self.request.user.is_shop_owner():
            return Service.objects.all()
        return Service.objects.all()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'])
    def revenue_dashboard(self, request):
        if not request.user.is_shop_owner():
            return Response({"detail": "you do not have permission to perform this action"})
        today = timezone.now().date()
        daily_revenue = Service.objects.filter(date__date=today).aggregate(Sum('total_cost'))['total_cost__sum'] or 0
        monthly_revenue = Service.objects.filter(date__month=today.month, date__year=today.year).aggregate(Sum('total_cost'))['total_cost__sum'] or 0
        yearly_revenue = Service.objects.filter(date__year=today.year).aggregate(Sum('total_cost'))['total_cost__sum'] or 0

        return Response({
            "daily_revenue": daily_revenue,
            "monthly_revenue": monthly_revenue,
            "yearly_revenue": yearly_revenue,
        })


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        service_id = self.kwargs.get('service_pk')

        if self.request.user.is_shop_owner() and service_id:
            return Invoice.objects.filter(service_id=service_id).select_related('service')

    def perform_create(self, serializer):
        service_id = self.kwargs.get("service_pk")
        service = get_object_or_404(Service, pk=service_id)
        serializer.save(service=service)

    def update(self, request, *args, **kwargs):
        try:
            print("*** reached here")
            service_id = self.kwargs.get('service_pk')
            invoice_id = self.kwargs.get('pk')

            invoice = get_object_or_404(Invoice, pk=invoice_id, service_id=service_id)
            self.check_object_permissions(self.request, invoice)

            serializer = self.get_serializer(invoice, data=self.request.data, partial=True)
            serializer.is_valid(raise_exception=True,)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(str(e))
            return Response({'error': 'An error occurred during the update.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, service_pk=None, pk=None):
        if not request.user.is_shop_owner():
            return Response({"detail": "you do not have permission to perform this action"})
        invoice = self.get_object()
        invoice.paid = True
        invoice.save()
        return Response({"status": "invoice marked as paid"})

    @action(detail=False, methods=['get'])
    def unpaid(self, request, service_pk=None):
        if not request.user.is_shop_owner():
            return Response({"detail": "you do not have permission to perform this action"})
        unpaid_invoices = self.get_queryset().filter(paid=False)
        serializer = self.get_serializer(unpaid_invoices, many=True)
        return Response(serializer.data)


def health_check(request):
    return JsonResponse({"status": "Health Check Ok"}, status=200)
