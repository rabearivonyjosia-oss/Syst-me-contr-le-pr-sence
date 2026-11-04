"""S\u00e9rialiseurs des s\u00e9ances, avec validations m\u00e9tier."""

from django.utils import timezone
from rest_framework import serializers

from gestion_cours.models import cours
from gestion_presence.models import Presence

from .models import Seance


class SeanceSerializer(serializers.ModelSerializer):
    cours_nom = serializers.CharField(source="cours.nom_cours", read_only=True)
    cours_niveau = serializers.CharField(source="cours.get_niveau_display", read_only=True)
    enseignant_nom = serializers.CharField(source="cours.enseignant.nom_complet", read_only=True)
    statut = serializers.CharField(read_only=True)
    statut_libelle = serializers.CharField(read_only=True)
    qr_valide = serializers.BooleanField(source="qr_est_valide", read_only=True)
    expiration_qr = serializers.DateTimeField(read_only=True)
    nb_presents = serializers.SerializerMethodField()
    nb_etudiants = serializers.SerializerMethodField()

    class Meta:
        model = Seance
        fields = [
            "id",
            "cours",
            "cours_nom",
            "cours_niveau",
            "enseignant_nom",
            "date_seance",
            "heure_debut",
            "heure_fin",
            "salle",
            "type_seance",
            "type_seance_libelle",
            "statut",
            "statut_libelle",
            "qr_valide",
            "expiration_qr",
            "nb_presents",
            "nb_etudiants",
        ]
        read_only_fields = [
            "id",
            "cours_nom",
            "cours_niveau",
            "enseignant_nom",
            "statut",
            "statut_libelle",
            "qr_valide",
            "expiration_qr",
            "nb_presents",
            "nb_etudiants",
        ]

    type_seance_libelle = serializers.CharField(
        source="get_type_seance_display", read_only=True
    )

    def get_nb_presents(self, obj):
        return obj.presences.filter(statut=Presence.Statut.PRESENT).count()

    def get_nb_etudiants(self, obj):
        return obj.cours.etudiants.count()

    # --- Validations ---------------------------------------------------
    def validate_salle(self, valeur):
        valeur = " ".join((valeur or "").split())
        if not valeur:
            raise serializers.ValidationError("Indiquez la salle de la s\u00e9ance.")
        return valeur

    def _chevauche(self, debut_a, fin_a, debut_b, fin_b):
        return debut_a < fin_b and debut_b < fin_a

    def _verifier_chevauchements(self, donnees):
        debut = donnees["heure_debut"]
        fin = donnees["heure_fin"]
        date = donnees["date_seance"]
        salle = donnees["salle"]
        cours_cible = donnees["cours"]

        autres = Seance.objects.filter(date_seance=date)
        if self.instance:
            autres = autres.exclude(pk=self.instance.pk)

        for seance in autres.select_related("cours", "cours__enseignant"):
            if not self._chevauche(debut, fin, seance.heure_debut, seance.heure_fin):
                continue
            if seance.cours_id == cours_cible.id:
                raise serializers.ValidationError(
                    {
                        "heure_debut": (
                            "Ce cours a d\u00e9j\u00e0 une s\u00e9ance sur ce cr\u00e9neau "
                            f"({seance.heure_debut:%H:%M} \u2013 {seance.heure_fin:%H:%M})."
                        )
                    }
                )
            if salle and seance.salle and seance.salle.lower() == salle.lower():
                raise serializers.ValidationError(
                    {
                        "salle": (
                            f"La salle {salle} est d\u00e9j\u00e0 occup\u00e9e de "
                            f"{seance.heure_debut:%H:%M} \u00e0 {seance.heure_fin:%H:%M}."
                        )
                    }
                )
            if seance.cours.enseignant_id == cours_cible.enseignant_id:
                raise serializers.ValidationError(
                    {
                        "heure_debut": (
                            "L'enseignant a d\u00e9j\u00e0 une s\u00e9ance sur ce cr\u00e9neau "
                            f"({seance.cours.nom_cours})."
                        )
                    }
                )

    def validate(self, attrs):
        request = self.context["request"]
        cours_cible = attrs.get("cours", getattr(self.instance, "cours", None))
        if cours_cible is None:
            raise serializers.ValidationError({"cours": "Choisissez un cours."})

        if not request.user.est_admin and cours_cible.enseignant_id != request.user.id:
            raise serializers.ValidationError(
                {"cours": "Vous ne pouvez planifier que les s\u00e9ances de vos propres cours."}
            )

        debut = attrs.get("heure_debut", getattr(self.instance, "heure_debut", None))
        fin = attrs.get("heure_fin", getattr(self.instance, "heure_fin", None))
        date = attrs.get("date_seance", getattr(self.instance, "date_seance", None))

        if debut is not None and fin is not None and fin <= debut:
            raise serializers.ValidationError(
                {"heure_fin": "L'heure de fin doit \u00eatre post\u00e9rieure \u00e0 l'heure de d\u00e9but."}
            )
        if date is not None and self.instance is None and date < timezone.localdate():
            raise serializers.ValidationError(
                {"date_seance": "La date de la s\u00e9ance ne peut pas \u00eatre pass\u00e9e."}
            )
        if (
            date is not None
            and debut is not None
            and fin is not None
            and attrs.get("salle", getattr(self.instance, "salle", ""))
        ):
            donnees = {
                "cours": cours_cible,
                "date_seance": date,
                "heure_debut": debut,
                "heure_fin": fin,
                "salle": attrs.get("salle", getattr(self.instance, "salle", "")),
            }
            self._verifier_chevauchements(donnees)
        return attrs


class SeanceDetailEtudiantSerializer(serializers.ModelSerializer):
    """Vue all\u00e9g\u00e9e pour un \u00e9tudiant : sa propre pr\u00e9sence."""

    cours_nom = serializers.CharField(source="cours.nom_cours", read_only=True)
    statut = serializers.CharField(read_only=True)
    statut_libelle = serializers.CharField(read_only=True)
    ma_presence = serializers.SerializerMethodField()

    class Meta:
        model = Seance
        fields = [
            "id",
            "cours",
            "cours_nom",
            "date_seance",
            "heure_debut",
            "heure_fin",
            "salle",
            "type_seance",
            "statut",
            "statut_libelle",
            "ma_presence",
        ]

    def get_ma_presence(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        presence = obj.presences.filter(etudiant=request.user).first()
        if not presence:
            return None
        return {
            "statut": presence.statut,
            "statut_libelle": presence.get_statut_display(),
            "timestamp": presence.timestamp,
            "motif_justification": presence.motif_justification,
        }


class CorrectionPresenceSerializer(serializers.Serializer):
    etudiant = serializers.IntegerField(min_value=1)
    statut = serializers.ChoiceField(choices=Presence.Statut.choices)
    motif_justification = serializers.CharField(
        required=False, allow_blank=True, max_length=255
    )

    def validate(self, attrs):
        if attrs["statut"] != Presence.Statut.JUSTIFIE:
            attrs["motif_justification"] = ""
        return attrs
