from django.test import TestCase
from .models import Vehicle


class VehicleTest(TestCase):
    def setUp(self):
        Vehicle.objects.create(license_plate="RJ14QD3193", model="Royal Enfield Meteor 350")

    def test_model_creation(self):
        vehicle = Vehicle.objects.get(license_plate="RJ14QD3193")
        self.assertEqual(vehicle.model, "Royal Enfield Meteor 350")
