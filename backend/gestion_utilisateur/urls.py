"""Routes d'authentification (montées sous /api/auth/)."""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangementMotDePasseView,
    ConnexionView,
    DeconnexionView,
    InscriptionView,
    MoiView,
)

urlpatterns = [
    path("login/", ConnexionView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MoiView.as_view(), name="moi"),
    path("register/", InscriptionView.as_view(), name="register"),
    path("change-password/", ChangementMotDePasseView.as_view(), name="change-password"),
    path("logout/", DeconnexionView.as_view(), name="logout"),
]
