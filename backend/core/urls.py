"""Configuration racine des routes de l'API et alias de compatibilité."""

from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

from gestion_cours.views import CoursViewSet
from gestion_utilisateur.views import ConnexionView, InscriptionView

urlpatterns = [
    path("admin/", admin.site.urls),
    # --- API canonique -------------------------------------------------
    path("api/auth/", include("gestion_utilisateur.urls")),
    path("api/", include("gestion_cours.urls")),
    path("api/", include("gestion_seance.urls")),
    path("api/", include("gestion_presence.urls")),
    # --- Alias de compatibilité (anciens chemins) ----------------------
    path("login/", ConnexionView.as_view(), name="legacy-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="legacy-token-refresh"),
    path("register/", InscriptionView.as_view(), name="legacy-register"),
    path(
        "cours/",
        CoursViewSet.as_view({"get": "list", "post": "create"}),
        name="legacy-cours",
    ),
]
