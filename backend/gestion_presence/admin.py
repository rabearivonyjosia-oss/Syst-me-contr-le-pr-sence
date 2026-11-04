"""Administration des présences."""

from django.contrib import admin

from .models import Presence


@admin.register(Presence)
class PresenceAdmin(admin.ModelAdmin):
    list_display = ("etudiant", "seance", "statut", "source", "timestamp")
    list_filter = ("statut", "source", "seance__cours")
    search_fields = (
        "etudiant__username",
        "etudiant__first_name",
        "etudiant__last_name",
        "etudiant__email",
    )
    readonly_fields = ("timestamp", "modifie_le")
    ordering = ("-timestamp",)
    list_select_related = ("etudiant", "seance")
