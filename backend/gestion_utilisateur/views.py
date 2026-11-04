"""Vues d'authentification, de profil et de mot de passe."""

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    ChangementMotDePasseSerializer,
    ConnexionSerializer,
    InscriptionSerializer,
    MiseAJourProfilSerializer,
    UtilisateurSerializer,
)


class ConnexionView(TokenObtainPairView):
    """POST /api/auth/login/ : renvoie access, refresh et le profil."""

    permission_classes = [AllowAny]
    serializer_class = ConnexionSerializer
    throttle_scope = "connexion"


class InscriptionView(generics.CreateAPIView):
    """POST /api/auth/register/ : inscription autonome d'un \u00e9tudiant."""

    permission_classes = [AllowAny]
    serializer_class = InscriptionSerializer
    throttle_scope = "inscription"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        utilisateur = serializer.save()
        return Response(
            {
                "detail": "Compte cr\u00e9\u00e9 avec succ\u00e8s. Vous pouvez maintenant vous connecter.",
                "user": UtilisateurSerializer(utilisateur).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MoiView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ : profil de l'utilisateur connect\u00e9."""

    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return MiseAJourProfilSerializer
        return UtilisateurSerializer

    def update(self, request, *args, **kwargs):
        partiel = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partiel)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "detail": "Profil mis \u00e0 jour.",
                "user": UtilisateurSerializer(instance).data,
            }
        )


class ChangementMotDePasseView(APIView):
    """POST /api/auth/change-password/."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangementMotDePasseSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Mot de passe modifi\u00e9 avec succ\u00e8s."},
            status=status.HTTP_200_OK,
        )


class DeconnexionView(APIView):
    """POST /api/auth/logout/ : le client efface ses jetons (pas de liste noire)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response(
            {"detail": "Vous \u00eates d\u00e9connect\u00e9."},
            status=status.HTTP_200_OK,
        )
