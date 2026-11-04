"""Vues des présences : scan du QR, statistiques et export CSV."""

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.exceptions import ErreurMetier
from core.permissions import EstEtudiant
from gestion_seance.models import Seance

from .models import Presence
from .serializers import PresenceSerializer, ScanSerializer
from .services import calculer_statistiques, exporter_csv


def _analyser_code(valeur):
    """Accepte le contenu du QR (`PQR:<id>:<token>`) ou le jeton seul."""
    code = (valeur or "").strip()
    if code.upper().startswith("PQR:"):
        morceaux = code.split(":")
        if len(morceaux) != 3 or not morceaux[1].isdigit():
            raise ErreurMetier(
                "Ce code ne correspond pas à un QR code de séance. "
                "Scannez le QR affiché par l'enseignant ou saisissez le code complet.",
                "qr_invalide",
            )
        return int(morceaux[1]), morceaux[2]
    return None, code


class ScanPresenceView(APIView):
    """POST /api/presences/scan/ : enregistre la présence de l'étudiant connecté."""

    permission_classes = [IsAuthenticated, EstEtudiant]
    throttle_scope = "scan"

    def post(self, request):
        serializer = ScanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        seance_id, jeton = _analyser_code(serializer.validated_data["token"])

        requete = Seance.objects.select_related("cours", "cours__enseignant")
        if seance_id is not None:
            seance = requete.filter(id=seance_id).first()
            if seance is None:
                raise ErreurMetier(
                    "Cette séance n'existe pas ou a été supprimée.",
                    "qr_invalide",
                    status.HTTP_404_NOT_FOUND,
                )
            if seance.token_qr != jeton:
                raise ErreurMetier(
                    "Ce QR code n'est plus valide : il a été renouvelé par l'enseignant. "
                    "Scannez le QR code affiché à l'écran.",
                    "qr_invalide",
                )
        else:
            seance = requete.filter(token_qr=jeton).first()
            if seance is None:
                raise ErreurMetier(
                    "Ce code ne correspond à aucune séance. "
                    "Vérifiez la saisie ou scannez le QR code affiché.",
                    "qr_invalide",
                )

        if not seance.cours.etudiants.filter(id=request.user.id).exists():
            raise ErreurMetier(
                "Vous n'êtes pas inscrit au cours de cette séance. "
                "Contactez votre enseignant pour être ajouté.",
                "non_inscrit",
                status.HTTP_403_FORBIDDEN,
            )

        statut_seance = seance.statut()
        if statut_seance == Seance.Statut.A_VENIR:
            raise ErreurMetier(
                "La séance n'a pas encore commencé. "
                "Le QR code sera accepté à partir de l'heure de début.",
                "seance_non_ouverte",
                status.HTTP_409_CONFLICT,
            )
        if statut_seance == Seance.Statut.TERMINEE:
            raise ErreurMetier(
                "La séance est terminée : l'émargement est fermé. "
                "Demandez à votre enseignant de corriger votre présence.",
                "seance_terminee",
                status.HTTP_409_CONFLICT,
            )

        if not seance.qr_est_valide():
            raise ErreurMetier(
                "Ce QR code a expiré. Scannez le nouveau QR code affiché par l'enseignant.",
                "qr_expire",
                status.HTTP_410_GONE,
            )

        presence = Presence.objects.filter(
            seance=seance, etudiant=request.user
        ).first()
        if presence:
            raise ErreurMetier(
                "Votre présence est déjà enregistrée pour cette séance.",
                "deja_present",
                status.HTTP_409_CONFLICT,
            )

        presence = Presence.objects.create(
            seance=seance,
            etudiant=request.user,
            statut=Presence.Statut.PRESENT,
            source=Presence.Source.SCAN,
        )
        return Response(
            {
                "detail": "Présence enregistrée. Vous êtes marqué présent.",
                "presence": PresenceSerializer(presence).data,
                "seance": {
                    "id": seance.id,
                    "cours_nom": seance.cours.nom_cours,
                    "date_seance": seance.date_seance,
                    "heure_debut": seance.heure_debut,
                    "heure_fin": seance.heure_fin,
                    "salle": seance.salle,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class StatistiquesView(APIView):
    """GET /api/stats/ : statistiques par cours, étudiant et période."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        donnees = calculer_statistiques(request.user, request.query_params)
        donnees["genere_le"] = timezone.now()
        return Response(donnees)


class ExportPresencesView(APIView):
    """GET /api/exports/presences/ : export CSV UTF-8 (BOM) compatible Excel."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        contenu, nb_lignes = exporter_csv(request.user, request.query_params)
        if nb_lignes == 0:
            raise ErreurMetier(
                "Aucune présence à exporter pour ces filtres. "
                "Élargissez la période ou choisissez un autre cours.",
                "export_vide",
                status.HTTP_404_NOT_FOUND,
            )
        reponse = HttpResponse(contenu, content_type="text/csv; charset=utf-8")
        reponse["Content-Disposition"] = (
            'attachment; filename="presences.csv"'
        )
        reponse["X-Nombre-Lignes"] = str(nb_lignes)
        return reponse
