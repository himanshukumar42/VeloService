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
    list_display = ("vehicle", "component", "is_repair")
    search_fields = ("vehicle",)
    list_filter = ("is_repair",)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "issue_date", "due_date", "total_amount", "paid")
    search_fields = ("invoice_number",)
    list_filter = ("issue_date", "paid")
    date_hierarchy = "due_date"
