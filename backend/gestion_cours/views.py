"""Vues des cours : CRUD, inscriptions et s\u00e9ances d'un cours."""

from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.exceptions import ErreurMetier
from core.permissions import EstGestionnaire, ProprietaireCours
from gestion_seance.models import Seance
from gestion_seance.serializers import SeanceDetailEtudiantSerializer, SeanceSerializer
from gestion_utilisateur.models import CustomUser

from .models import cours
from .serializers import (
    CoursSerializer,
    EtudiantSerializer,
    InscriptionEtudiantsSerializer,
)


class CoursViewSet(viewsets.ModelViewSet):
    """CRUD des cours.

    - administrateur : tous les cours ;
    - enseignant : ses cours ;
    - \u00e9tudiant : les cours auxquels il est inscrit (lecture seule).
    """

    serializer_class = CoursSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["nom_cours"]
    ordering_fields = ["nom_cours", "niveau", "date_creation"]
    ordering = ["nom_cours"]

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy"}:
            return [IsAuthenticated(), EstGestionnaire()]
        return [IsAuthenticated()]

    def get_queryset(self):
        utilisateur = self.request.user
        requete = cours.objects.select_related("enseignant")
        if utilisateur.est_admin:
            pass
        elif utilisateur.est_enseignant:
            requete = requete.filter(enseignant=utilisateur)
        else:
            requete = requete.filter(etudiants=utilisateur)

        niveau = self.request.query_params.get("niveau")
        if niveau:
            requete = requete.filter(niveau=niveau)
        recherche = self.request.query_params.get("search")
        if recherche:
            requete = requete.filter(nom_cours__icontains=recherche)
        return requete.order_by("nom_cours")

    def perform_create(self, serializer):
        serializer.save()

    def _cours_autorise(self, cours_cible):
        utilisateur = self.request.user
        if utilisateur.est_admin:
            return
        if cours_cible.enseignant_id != utilisateur.id:
            raise ErreurMetier(
                "Vous ne pouvez g\u00e9rer que les cours dont vous \u00eates responsable.",
                "acces_refuse",
                status.HTTP_403_FORBIDDEN,
            )

    @action(detail=True, methods=["get", "post", "delete"], url_path="etudiants")
    def etudiants(self, request, pk=None):
        cours_cible = self.get_object()
        self._cours_autorise(cours_cible)

        if request.method == "GET":
            inscrits = cours_cible.etudiants.all().order_by("username")
            return Response(EtudiantSerializer(inscrits, many=True).data)

        serializer = InscriptionEtudiantsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifiants = serializer.validated_data["etudiant_ids"]

        if request.method == "POST":
            cours_cible.etudiants.add(*identifiants)
            message = "Les \u00e9tudiants s\u00e9lectionn\u00e9s ont \u00e9t\u00e9 inscrits au cours."
        else:
            cours_cible.etudiants.remove(*identifiants)
            message = "Les \u00e9tudiants s\u00e9lectionn\u00e9s ont \u00e9t\u00e9 retir\u00e9s du cours."

        return Response(
            {
                "detail": message,
                "etudiants": EtudiantSerializer(
                    cours_cible.etudiants.all().order_by("username"), many=True
                ).data,
            }
        )

    @action(detail=True, methods=["get"], url_path="etudiants/disponibles")
    def etudiants_disponibles(self, request, pk=None):
        cours_cible = self.get_object()
        self._cours_autorise(cours_cible)
        recherche = (request.query_params.get("search") or "").strip()
        deja_inscrits = cours_cible.etudiants.values_list("id", flat=True)
        requete = CustomUser.objects.filter(
            role=CustomUser.Role.ETUDIANT
        ).exclude(id__in=deja_inscrits)
        if recherche:
            requete = requete.filter(
                Q(username__icontains=recherche)
                | Q(email__icontains=recherche)
                | Q(num_matricule__icontains=recherche)
            )
        return Response(
            EtudiantSerializer(requete.order_by("username")[:100], many=True).data
        )

    @action(detail=True, methods=["get"], url_path="seances")
    def seances(self, request, pk=None):
        cours_cible = self.get_object()
        requete = (
            Seance.objects.filter(cours=cours_cible)
            .select_related("cours", "cours__enseignant")
            .order_by("date_seance", "heure_debut")
        )
        if request.user.est_etudiant:
            return Response(
                SeanceDetailEtudiantSerializer(
                    requete, many=True, context={"request": request}
                ).data
            )
        return Response(SeanceSerializer(requete, many=True).data)
