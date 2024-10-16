from django.contrib import admin
from .models import Vehicle, Component, Issue, Invoice


class IssueInline(admin.TabularInline):
    model = Issue
    extra = 1


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("license_plate", "model")
    search_fields = (
        "license_plate",
        "model",
    )
    list_filter = ("model",)
    inlines = [IssueInline]


@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ("name", "new_price", "repair_price")
    search_fields = ("name",)
    list_filter = ("new_price", "repair_price")


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "component", "is_new")
    search_fields = ("vehicle",)
    list_filter = ("is_new",)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "total_price", "date")
    search_fields = ("vehicle__license_plate",)
    list_filter = ("date",)
    date_hierarchy = "date"
