from rest_framework import serializers
from .models import CustomUser
  
 #triate les demande opour l'API

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'role',
            'niveau',
            'num_matricule',
            'password',
        ]
        extra_kwargs={
            "password": {"write_only": True},
            "num_matricule": {"required": False},
            "niveau": {"required": False},
        }

    def validate(self, data):
        role = data.get("role")
        num_matricule = data.get("num_matricule")

        # Si étudiant → matricule obligatoire
        if role == "ETUDIANT" and not num_matricule:
            raise serializers.ValidationError({
                "num_matricule": "Le numéro matricule est obligatoire pour un étudiant."
            })

        # Si enseignant ou admin → matricule interdit
        if role in ["ENSEIGNANT", "ADMIN"] and num_matricule:
            raise serializers.ValidationError({
                "num_matricule": "Seul un étudiant peut avoir un numéro matricule."
            })

        return data

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data.get("role"),
            niveau=validated_data.get("niveau"),
            num_matricule=validated_data.get("num_matricule"),
        )
        return user

