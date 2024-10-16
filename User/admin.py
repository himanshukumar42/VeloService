from django.contrib import admin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_user', 'is_owner', 'is_superuser')
    search_fields = ('email', )
    list_filter = ('is_user', 'is_owner')
