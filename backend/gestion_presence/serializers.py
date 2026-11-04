"""S\u00e9rialiseurs des pr\u00e9sences et du scan."""

from rest_framework import serializers

from .models import Presence


class PresenceSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.CharField(source="etudiant.nom_complet", read_only=True)
    etudiant_email = serializers.CharField(source="etudiant.email", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    source_libelle = serializers.CharField(source="get_source_display", read_only=True)
    modifie_par_nom = serializers.CharField(
        source="modifie_par.nom_complet", read_only=True, default=None
    )

    class Meta:
        model = Presence
        fields = [
            "id",
            "seance",
            "etudiant",
            "etudiant_nom",
            "etudiant_email",
            "statut",
            "statut_libelle",
            "motif_justification",
            "source",
            "source_libelle",
            "timestamp",
            "modifie_par",
            "modifie_par_nom",
            "modifie_le",
        ]
        read_only_fields = fields


class ScanSerializer(serializers.Serializer):
    token = serializers.CharField(
        max_length=255,
        trim_whitespace=True,
        error_messages={
            "blank": "Saisissez ou scannez le code de la s\u00e9ance.",
            "required": "Saisissez ou scannez le code de la s\u00e9ance.",
        },
    )

    def validate_token(self, valeur):
        if not valeur.strip():
            raise serializers.ValidationError(
                "Saisissez ou scannez le code de la s\u00e9ance."
            )
        return valeur.strip()
