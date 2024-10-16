from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Component, Vehicle, Issue, Invoice
from .serializers import ComponentSerializer, VehicleSerializer, IssueSerializer, InvoiceSerializer


class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        issues = request.data.get("issues")
        total_price = 0
        for issue in issues:
            component = Component.objects.get(id=issue['component'])
            total_price += component.new_price if issue['is_new'] else component.repair_price

        vehicle = Vehicle.objects.get(id=request.data.get('vehicle'))
        invoice = Invoice.objects.create(vehicle=vehicle, total_price=total_price)
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)


def health_check(request):
    return JsonResponse({"status": "Health Check Ok"}, status=200)
