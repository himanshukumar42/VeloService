from rest_framework import serializers
from .models import Component, Vehicle, Issue, Invoice, Service
from User.models import CustomUser
from User.auth.user_serializers import UserSerializer


class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = "__all__"


class VehicleSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    owner_email = serializers.EmailField(source='owner.email', read_only=True)

    class Meta:
        model = Vehicle
        fields = '__all__'

    def create(self, validated_data):
        owner = validated_data.pop("owner")
        vehicle = Vehicle.objects.create(owner=owner, **validated_data)
        return vehicle


class IssueSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(read_only=True)
    component = serializers.PrimaryKeyRelatedField(queryset=Component.objects.all())
    component_name = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = "__all__"

    def get_component_name(self, obj):
        return obj.component.name if obj.component else None


class ServiceSerializer(serializers.ModelSerializer):
    vehicle = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all())
    issues = serializers.PrimaryKeyRelatedField(queryset=Issue.objects.all(), many=True)

    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['total_cost']

    def create(self, validated_data):
        issues_data = validated_data.pop('issues', [])
        service = Service(**validated_data)
        service.total_cost = self.calculate_service_cost(service, issues_data)
        service.save()
        service.issues.set(issues_data)
        return service

    def calculate_service_cost(self, service, issue_data):
        total_cost = 0
        for issue in issue_data:
            if issue.is_repair:
                total_cost += issue.component.repair_price
            else:
                total_cost += issue.component.new_price

        return total_cost

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['vehicle'] = VehicleSerializer(instance.vehicle).data
        representation['issues'] = IssueSerializer(instance.issues.all(), many=True).data
        return representation


class InvoiceSerializer(serializers.ModelSerializer):
    service = ServiceSerializer(read_only=True)

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
