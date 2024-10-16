from django.db import models


class Component(models.Model):
    name = models.CharField(max_length=255)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    repair_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class Vehicle(models.Model):
    license_plate = models.CharField(max_length=20)
    model = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.license_plate} - {self.model}"


class Issue(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    is_new = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.vehicle} - {self.component}"


class Invoice(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice for {self.vehicle} - {self.total_price}"
