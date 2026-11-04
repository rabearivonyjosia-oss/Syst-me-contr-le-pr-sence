"""Routes de l'application présences (montées sous /api/)."""

from django.urls import path

from .views import ExportPresencesView, ScanPresenceView, StatistiquesView

urlpatterns = [
    path("presences/scan/", ScanPresenceView.as_view(), name="presence-scan"),
    path("stats/", StatistiquesView.as_view(), name="statistiques"),
    path("exports/presences/", ExportPresencesView.as_view(), name="export-presences"),
]
