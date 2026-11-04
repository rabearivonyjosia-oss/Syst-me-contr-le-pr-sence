"""Annuaire des utilisateurs utiles aux formulaires (enseignants, étudiants)."""

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.exceptions import ErreurMetier
from core.permissions import EstGestionnaire

Utilisateur = get_user_model()


class AnnuaireView(APIView):
    """GET /api/auth/utilisateurs/<role>/ : liste minimale pour les sélecteurs."""

    permission_classes = [IsAuthenticated, EstGestionnaire]

    def get(self, request, role):
        role = role.upper()
        if role not in {Utilisateur.Role.ENSEIGNANT, Utilisateur.Role.ETUDIANT}:
            raise ErreurMetier("Rôle inconnu.", "role_invalide", 404)
        requete = Utilisateur.objects.filter(role=role, is_active=True)
        recherche = (request.query_params.get("search") or "").strip()
        if recherche:
            requete = requete.filter(
                Q(username__icontains=recherche)
                | Q(first_name__icontains=recherche)
                | Q(last_name__icontains=recherche)
                | Q(email__icontains=recherche)
                | Q(num_matricule__icontains=recherche)
            )
        donnees = [
            {
                "id": utilisateur.id,
                "username": utilisateur.username,
                "nom_complet": utilisateur.nom_complet,
                "email": utilisateur.email,
                "niveau": utilisateur.niveau,
                "niveau_libelle": utilisateur.get_niveau_display(),
                "num_matricule": utilisateur.num_matricule,
            }
            for utilisateur in requete.order_by("username")[:200]
        ]
        return Response(donnees)
