from django.db import models
from User.models import CustomUser
from datetime import date, timedelta


class Component(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    repair_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    make = models.CharField(max_length=50)
    license_plate = models.CharField(max_length=20)
    model = models.CharField(max_length=100)
    year = models.IntegerField()

    def __str__(self):
        return f"{self.license_plate} - {self.make} - {self.model} = {self.year}"


class Issue(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    description = models.TextField()
    component = models.ForeignKey(Component, on_delete=models.SET_NULL, null=True, blank=True)
    is_repair = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.vehicle} - {self.description[:50]} - {self.component}"


class Service(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    issues = models.ManyToManyField(Issue)
    date = models.DateTimeField(auto_now_add=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Service for {self.vehicle} on {self.date}"


class Invoice(models.Model):
    service = models.OneToOneField(Service, on_delete=models.CASCADE)
    invoice_number = models.CharField(max_length=20, unique=True)
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(default=date.today() + timedelta(days=15))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Invoice {self.invoice_number} for {self.service}"
