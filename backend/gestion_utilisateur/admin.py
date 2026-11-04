"""Administration des utilisateurs."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "niveau", "num_matricule", "is_active")
    list_filter = ("role", "niveau", "is_active", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name", "num_matricule")
    ordering = ("username",)
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Profil pédagogique",
            {"fields": ("role", "niveau", "num_matricule", "telephone")},
        ),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            "Profil pédagogique",
            {"fields": ("email", "role", "niveau", "num_matricule", "telephone")},
        ),
    )
