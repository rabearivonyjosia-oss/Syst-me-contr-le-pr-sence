"""S\u00e9rialiseurs d'authentification et de profil."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

Utilisateur = get_user_model()


class UtilisateurSerializer(serializers.ModelSerializer):
    """Profil public / courant (jamais de mot de passe)."""

    nom_complet = serializers.CharField(read_only=True)
    role_libelle = serializers.CharField(source="get_role_display", read_only=True)
    niveau_libelle = serializers.CharField(source="get_niveau_display", read_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "nom_complet",
            "role",
            "role_libelle",
            "niveau",
            "niveau_libelle",
            "num_matricule",
            "telephone",
            "date_joined",
        ]
        read_only_fields = fields


class ConnexionSerializer(TokenObtainPairSerializer):
    """Login par email : ajoute le r\u00f4le au jeton et renvoie le profil."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["username"] = user.username
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UtilisateurSerializer(self.user).data
        data["detail"] = "Connexion r\u00e9ussie."
        return data


class InscriptionSerializer(serializers.ModelSerializer):
    """Inscription autonome r\u00e9serv\u00e9e aux \u00e9tudiants."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=False)
    niveau = serializers.ChoiceField(choices=Utilisateur.Niveau.choices)
    num_matricule = serializers.CharField(max_length=20)

    class Meta:
        model = Utilisateur
        fields = [
            "id",
            "username",
            "email",
            "password",
            "password_confirm",
            "niveau",
            "num_matricule",
            "telephone",
        ]
        extra_kwargs = {
            "telephone": {"required": False, "allow_blank": True},
        }

    def validate_email(self, valeur):
        if Utilisateur.objects.filter(email__iexact=valeur).exists():
            raise serializers.ValidationError(
                "Un compte existe d\u00e9j\u00e0 avec cette adresse email."
            )
        return valeur.lower()

    def validate_num_matricule(self, valeur):
        valeur = (valeur or "").strip()
        if not valeur:
            raise serializers.ValidationError(
                "Le num\u00e9ro de matricule est obligatoire pour un \u00e9tudiant."
            )
        if Utilisateur.objects.filter(num_matricule__iexact=valeur).exists():
            raise serializers.ValidationError(
                "Ce num\u00e9ro de matricule est d\u00e9j\u00e0 utilis\u00e9."
            )
        return valeur

    def validate(self, attrs):
        confirmation = attrs.pop("password_confirm", None)
        if confirmation is not None and confirmation != attrs.get("password"):
            raise serializers.ValidationError(
                {"password_confirm": "La confirmation ne correspond pas au mot de passe."}
            )
        candidat = Utilisateur(
            username=attrs.get("username", ""),
            email=attrs.get("email", ""),
        )
        try:
            validate_password(attrs.get("password", ""), user=candidat)
        except DjangoValidationError as erreur:
            raise serializers.ValidationError({"password": list(erreur.messages)})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm", None)
        mot_de_passe = validated_data.pop("password")
        return Utilisateur.objects.create_user(
            password=mot_de_passe,
            role=Utilisateur.Role.ETUDIANT,
            **validated_data,
        )


class MiseAJourProfilSerializer(serializers.ModelSerializer):
    """Champs modifiables par l'utilisateur lui-m\u00eame."""

    class Meta:
        model = Utilisateur
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "telephone",
            "niveau",
            "num_matricule",
        ]
        extra_kwargs = {
            "telephone": {"required": False, "allow_blank": True},
            "niveau": {"required": False, "allow_null": True},
            "num_matricule": {"required": False, "allow_null": True, "allow_blank": True},
        }

    def validate_email(self, valeur):
        valeur = valeur.lower()
        requete = Utilisateur.objects.filter(email__iexact=valeur)
        if self.instance:
            requete = requete.exclude(pk=self.instance.pk)
        if requete.exists():
            raise serializers.ValidationError(
                "Un autre compte utilise d\u00e9j\u00e0 cette adresse email."
            )
        return valeur

    def validate(self, attrs):
        instance = self.instance
        role = instance.role if instance else None
        niveau = attrs.get("niveau", instance.niveau if instance else None)
        matricule = attrs.get(
            "num_matricule", instance.num_matricule if instance else None
        )
        if role == Utilisateur.Role.ETUDIANT:
            if not niveau:
                raise serializers.ValidationError(
                    {"niveau": "Le niveau est obligatoire pour un \u00e9tudiant."}
                )
            if not matricule:
                raise serializers.ValidationError(
                    {"num_matricule": "Le num\u00e9ro de matricule est obligatoire."}
                )
        return attrs


class ChangementMotDePasseSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, valeur):
        utilisateur = self.context["request"].user
        if not utilisateur.check_password(valeur):
            raise serializers.ValidationError("Le mot de passe actuel est incorrect.")
        return valeur

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "La confirmation ne correspond pas au nouveau mot de passe."}
            )
        if attrs["new_password"] == attrs["current_password"]:
            raise serializers.ValidationError(
                {"new_password": "Le nouveau mot de passe doit \u00eatre diff\u00e9rent de l'actuel."}
            )
        utilisateur = self.context["request"].user
        try:
            validate_password(attrs["new_password"], user=utilisateur)
        except DjangoValidationError as erreur:
            raise serializers.ValidationError({"new_password": list(erreur.messages)})
        return attrs

    def save(self, **kwargs):
        utilisateur = self.context["request"].user
        utilisateur.set_password(self.validated_data["new_password"])
        utilisateur.save(update_fields=["password"])
        return utilisateur
