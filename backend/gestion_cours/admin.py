"""Administration des cours."""

from django.contrib import admin

from .models import cours


@admin.register(cours)
class CoursAdmin(admin.ModelAdmin):
    list_display = ("nom_cours", "niveau", "enseignant", "date_creation")
    list_filter = ("niveau",)
    search_fields = ("nom_cours", "enseignant__username", "enseignant__email")
    filter_horizontal = ("etudiants",)
    autocomplete_fields = ("enseignant",)
    list_select_related = ("enseignant",)
