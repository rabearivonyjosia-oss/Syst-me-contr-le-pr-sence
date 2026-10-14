from rest_framework import serializers
from .models import cours
from gestion_utilisateur.models import CustomUser


#regiter pour les cours crée

class coursSerializer(serializers.ModelSerializer):
    nom_enseignant = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(role="ENSEIGNANT")
    )

    class Meta:
        model = cours
        fields = [
            'id',
            'nom_cours',
            'nom_enseignant',
            'niveau',
            'date_creation',
            
        ]
        read_only_fields= [
            "id",
            "nom_enseignant",
            "date_creation",
            ]


    def create(self, validated_data):

        request=self.context['request']

        cours_cree = cours.objects.create(
            nom_cours=validated_data['nom_cours'],
            nom_enseignant=request.user,
            niveau=validated_data['niveau'],
            
        )

        return cours_cree
