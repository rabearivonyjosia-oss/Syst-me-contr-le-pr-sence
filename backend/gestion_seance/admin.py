"""Administration des séances."""

from django.contrib import admin

from .models import Seance


@admin.register(Seance)
class SeanceAdmin(admin.ModelAdmin):
    list_display = ("cours", "date_seance", "heure_debut", "heure_fin", "salle", "type_seance")
    list_filter = ("date_seance", "type_seance", "cours")
    search_fields = ("cours__nom_cours", "salle")
    autocomplete_fields = ("cours",)
    list_select_related = ("cours",)
    readonly_fields = ("token_qr", "expiration_qr")
