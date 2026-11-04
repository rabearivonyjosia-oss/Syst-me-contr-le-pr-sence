"""Vues des s\u00e9ances : CRUD, QR temporaire et feuille de pr\u00e9sence."""

from datetime import date

from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.exceptions import ErreurMetier
from core.permissions import EstGestionnaire
from gestion_presence.models import Presence
from gestion_presence.serializers import PresenceSerializer

from .models import Seance
from .serializers import (
    CorrectionPresenceSerializer,
    SeanceDetailEtudiantSerializer,
    SeanceSerializer,
)


class SeanceViewSet(viewsets.ModelViewSet):
    """S\u00e9ances visibles selon le r\u00f4le, modifiables par leur enseignant."""

    serializer_class = SeanceSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        actions_ecriture = {
            "create",
            "update",
            "partial_update",
            "destroy",
            "qr",
            "presences",
        }
        if self.action in actions_ecriture:
            return [IsAuthenticated(), EstGestionnaire()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.user.est_etudiant and self.action in {"list", "retrieve"}:
            return SeanceDetailEtudiantSerializer
        return SeanceSerializer

    # --- Filtrage ------------------------------------------------------
    def get_queryset(self):
        utilisateur = self.request.user
        requete = Seance.objects.select_related("cours", "cours__enseignant")

        if utilisateur.est_admin:
            pass
        elif utilisateur.est_enseignant:
            requete = requete.filter(cours__enseignant=utilisateur)
        else:
            requete = requete.filter(cours__etudiants=utilisateur)

        params = self.request.query_params
        cours_id = params.get("cours")
        if cours_id:
            if not str(cours_id).isdigit():
                raise ErreurMetier("Le cours demand\u00e9 est invalide.", "filtre_invalide")
            requete = requete.filter(cours_id=int(cours_id))

        aujourd_hui = timezone.localdate()
        maintenant = timezone.localtime().time()

        statut_filtre = params.get("statut")
        if statut_filtre == Seance.Statut.A_VENIR:
            requete = requete.filter(
                Q(date_seance__gt=aujourd_hui)
                | Q(date_seance=aujourd_hui, heure_debut__gt=maintenant)
            )
        elif statut_filtre == Seance.Statut.EN_COURS:
            requete = requete.filter(
                date_seance=aujourd_hui,
                heure_debut__lte=maintenant,
                heure_fin__gt=maintenant,
            )
        elif statut_filtre == Seance.Statut.TERMINEE:
            requete = requete.filter(
                Q(date_seance__lt=aujourd_hui)
                | Q(date_seance=aujourd_hui, heure_fin__lte=maintenant)
            )

        a_venir = params.get("a_venir") or params.get("upcoming")
        if a_venir in {"1", "true", "oui"}:
            requete = requete.filter(
                Q(date_seance__gt=aujourd_hui)
                | Q(date_seance=aujourd_hui, heure_fin__gt=maintenant)
            )

        date_debut = params.get("date_debut")
        date_fin = params.get("date_fin")
        if date_debut:
            requete = requete.filter(date_seance__gte=self._date_valide(date_debut))
        if date_fin:
            requete = requete.filter(date_seance__lte=self._date_valide(date_fin))

        recherche = (params.get("search") or "").strip()
        if recherche:
            requete = requete.filter(
                Q(cours__nom_cours__icontains=recherche)
                | Q(salle__icontains=recherche)
            )

        tri = params.get("ordering") or "date_seance,heure_debut"
        tris_autorises = {
            "date_seance",
            "-date_seance",
            "heure_debut",
            "-heure_debut",
            "cours__nom_cours",
            "-cours__nom_cours",
        }
        morceaux = [item for item in tri.split(",") if item in tris_autorises]
        return requete.order_by(*(morceaux or ["date_seance", "heure_debut"]))

    @staticmethod
    def _date_valide(valeur):
        try:
            return date.fromisoformat(valeur)
        except (TypeError, ValueError):
            raise ErreurMetier(
                "La date doit \u00eatre au format aaaa-mm-jj.", "filtre_invalide"
            )

    # --- Permissions objet --------------------------------------------
    def _verifier_proprietaire(self, seance):
        if self.request.user.est_admin:
            return
        if seance.cours.enseignant_id != self.request.user.id:
            raise ErreurMetier(
                "Vous ne pouvez g\u00e9rer que les s\u00e9ances de vos propres cours.",
                "acces_refuse",
                status.HTTP_403_FORBIDDEN,
            )

    def update(self, request, *args, **kwargs):
        self._verifier_proprietaire(self.get_object())
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._verifier_proprietaire(self.get_object())
        return super().destroy(request, *args, **kwargs)

    # --- QR code -------------------------------------------------------
    @action(detail=True, methods=["get", "post"], url_path="qr")
    def qr(self, request, pk=None):
        seance = self.get_object()
        self._verifier_proprietaire(seance)

        if request.method == "GET":
            actif = seance.qr_est_valide() and seance.est_en_cours()
            donnees = {
                "actif": actif,
                "seance": seance.id,
                "seance_statut": seance.statut(),
                "emargement_ouvert": seance.est_en_cours(),
                "expiration": seance.expiration_qr,
                "expires_in": seance.secondes_restantes_qr() if actif else 0,
            }
            if actif:
                donnees.update(
                    {
                        "token": seance.token_qr,
                        "qr_payload": f"PQR:{seance.id}:{seance.token_qr}",
                    }
                )
            return Response(donnees)

        if not seance.peut_generer_qr():
            raise ErreurMetier(
                "La s\u00e9ance n'est pas ouverte : le QR code est disponible de "
                "10 minutes avant le d\u00e9but jusqu'\u00e0 la fin de la s\u00e9ance.",
                "seance_non_ouverte",
                status.HTTP_409_CONFLICT,
            )

        token = seance.generer_qr()
        return Response(
            {
                "detail": "Nouveau QR code g\u00e9n\u00e9r\u00e9.",
                "actif": True,
                "seance": seance.id,
                "seance_statut": seance.statut(),
                "emargement_ouvert": seance.est_en_cours(),
                "token": token,
                "qr_payload": f"PQR:{seance.id}:{token}",
                "expiration": seance.expiration_qr,
                "expires_in": seance.secondes_restantes_qr(),
            },
            status=status.HTTP_201_CREATED,
        )

    # --- Feuille de pr\u00e9sence ------------------------------------------
    @action(detail=True, methods=["get", "post"], url_path="presences")
    def presences(self, request, pk=None):
        seance = self.get_object()
        self._verifier_proprietaire(seance)

        if request.method == "POST":
            return self._corriger_presence(request, seance)

        etudiants = seance.cours.etudiants.all().order_by("username")
        presences = {
            presence.etudiant_id: presence
            for presence in seance.presences.select_related("etudiant").all()
        }

        lignes = []
        compteurs = {
            Presence.Statut.PRESENT: 0,
            Presence.Statut.ABSENT: 0,
            Presence.Statut.JUSTIFIE: 0,
        }
        for etudiant in etudiants:
            presence = presences.get(etudiant.id)
            statut = presence.statut if presence else Presence.Statut.ABSENT
            compteurs[statut] = compteurs.get(statut, 0) + 1
            lignes.append(
                {
                    "etudiant": etudiant.id,
                    "username": etudiant.username,
                    "nom_complet": etudiant.nom_complet,
                    "email": etudiant.email,
                    "num_matricule": etudiant.num_matricule,
                    "niveau": etudiant.niveau,
                    "niveau_libelle": etudiant.get_niveau_display(),
                    "statut": statut,
                    "statut_libelle": Presence.Statut(statut).label,
                    "motif_justification": (
                        presence.motif_justification if presence else ""
                    ),
                    "source": presence.source if presence else "",
                    "presence_id": presence.id if presence else None,
                    "timestamp": presence.timestamp if presence else None,
                    "modifie_le": presence.modifie_le if presence else None,
                }
            )

        total = len(lignes)
        taux = round((compteurs[Presence.Statut.PRESENT] / total) * 100, 1) if total else 0
        return Response(
            {
                "seance": SeanceSerializer(seance, context={"request": request}).data,
                "resume": {
                    "total": total,
                    "presents": compteurs[Presence.Statut.PRESENT],
                    "absents": compteurs[Presence.Statut.ABSENT],
                    "justifies": compteurs[Presence.Statut.JUSTIFIE],
                    "taux_presence": taux,
                },
                "etudiants": lignes,
                "genere_le": timezone.now(),
            }
        )

    def _corriger_presence(self, request, seance):
        serializer = CorrectionPresenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        donnees = serializer.validated_data
        etudiant_id = donnees["etudiant"]

        if not seance.cours.etudiants.filter(id=etudiant_id).exists():
            raise ErreurMetier(
                "Cet \u00e9tudiant n'est pas inscrit au cours de cette s\u00e9ance.",
                "etudiant_non_inscrit",
                status.HTTP_400_BAD_REQUEST,
            )

        presence, creee = Presence.objects.update_or_create(
            seance=seance,
            etudiant_id=etudiant_id,
            defaults={
                "statut": donnees["statut"],
                "motif_justification": donnees.get("motif_justification", ""),
                "source": Presence.Source.MANUEL,
                "modifie_par": request.user,
            },
        )
        return Response(
            {
                "detail": (
                    "Pr\u00e9sence enregistr\u00e9e."
                    if creee
                    else "Statut de pr\u00e9sence mis \u00e0 jour."
                ),
                "presence": PresenceSerializer(presence).data,
            },
            status=status.HTTP_201_CREATED if creee else status.HTTP_200_OK,
        )
