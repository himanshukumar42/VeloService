from rest_framework import serializers
from .models import Component, Vehicle, Issue, Invoice, Service
from User.auth.user_serializers import UserSerializer


class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = "__all__"


class VehicleSerializer(serializers.ModelSerializer):
    owner = UserSerializer

    class Meta:
        model = Vehicle
        fields = "__all__"


class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    issues = IssueSerializer(many=True, read_only=True)

    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['total_cost']

    def create(self, validated_data):
        issues_data = validated_data.pop('issues', [])
        service = Service.objects.create(**validated_data)
        for issue_data in issues_data:
            Issue.objects.create(service=service, **issue_data)
        service.total_cost = self.calculate_service_cost(service)
        service.save()
        return service

    def calculate_service_cost(self, service):
        total_cost = 0
        for issue in service.issues.all():
            if issue.is_repair:
                total_cost += issue.component.repair_price
            else:
                total_cost += issue.component.new_price

        return total_cost


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ['invoice_number', 'issue_date', 'total_amount']

    def create(self, validated_data):
        invoice_number = f"INV-{Invoice.objects.count() + 1:04d}"
        service = validated_data.get('service')
        total_amount = service.total_cost

        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            total_amount=total_amount,
            **validated_data
        )
        return invoice
