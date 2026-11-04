"""S\u00e9rialiseurs des cours et des inscriptions."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import cours

Utilisateur = get_user_model()


class EtudiantSerializer(serializers.ModelSerializer):
    nom_complet = serializers.CharField(read_only=True)
    niveau_libelle = serializers.CharField(source="get_niveau_display", read_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "username",
            "nom_complet",
            "email",
            "niveau",
            "niveau_libelle",
            "num_matricule",
        ]
        read_only_fields = fields


class CoursSerializer(serializers.ModelSerializer):
    enseignant = serializers.PrimaryKeyRelatedField(read_only=True)
    enseignant_nom = serializers.CharField(source="enseignant.nom_complet", read_only=True)
    niveau_libelle = serializers.CharField(source="get_niveau_display", read_only=True)
    nb_etudiants = serializers.SerializerMethodField()
    nb_seances = serializers.SerializerMethodField()
    enseignant_id = serializers.PrimaryKeyRelatedField(
        source="enseignant",
        queryset=Utilisateur.objects.filter(role=Utilisateur.Role.ENSEIGNANT),
        write_only=True,
        required=False,
    )

    class Meta:
        model = cours
        fields = [
            "id",
            "nom_cours",
            "niveau",
            "niveau_libelle",
            "enseignant",
            "enseignant_nom",
            "enseignant_id",
            "nb_etudiants",
            "nb_seances",
            "date_creation",
        ]
        read_only_fields = ["id", "enseignant", "enseignant_nom", "date_creation"]

    def get_nb_etudiants(self, obj):
        return obj.etudiants.count()

    def get_nb_seances(self, obj):
        return obj.seances.count()

    def validate_nom_cours(self, valeur):
        valeur = " ".join((valeur or "").split())
        if len(valeur) < 2:
            raise serializers.ValidationError(
                "Le nom du cours doit contenir au moins 2 caract\u00e8res."
            )
        return valeur

    def validate_niveau(self, valeur):
        niveaux = {choix[0] for choix in cours.NIVEAU_CHOICES}
        if valeur not in niveaux:
            raise serializers.ValidationError("Choisissez un niveau valide.")
        return valeur

    def validate(self, attrs):
        request = self.context["request"]
        destinataire = attrs.get("enseignant")
        if request.user.est_admin:
            if not self.instance and not destinataire:
                raise serializers.ValidationError(
                    {"enseignant_id": "Choisissez l'enseignant responsable du cours."}
                )
        else:
            if not request.user.est_enseignant:
                raise serializers.ValidationError(
                    "Seuls les enseignants et les administrateurs peuvent g\u00e9rer les cours."
                )
            attrs["enseignant"] = request.user
        return attrs

    def create(self, validated_data):
        return cours.objects.create(**validated_data)


class InscriptionEtudiantsSerializer(serializers.Serializer):
    etudiant_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )

    def validate_etudiant_ids(self, valeurs):
        ids = list(dict.fromkeys(valeurs))
        trouves = set(
            Utilisateur.objects.filter(
                id__in=ids, role=Utilisateur.Role.ETUDIANT
            ).values_list("id", flat=True)
        )
        manquants = [identifiant for identifiant in ids if identifiant not in trouves]
        if manquants:
            raise serializers.ValidationError(
                "Certains identifiants ne correspondent pas \u00e0 des \u00e9tudiants."
            )
        return ids
