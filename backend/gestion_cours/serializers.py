from rest_framework import serializers
from .model import cours

#regiter pour les cours crée

class coursSerializer(serializers.ModelssSerializer):
    class Meta:
        model = cours
        fields = [
            'id',
            'nom_cours',
            'nom_professeur',
            'niveau',
            'duree',

        ]
    def create(self, validated_data):
        cours = cours.objects.create_cours(
            nom_cours=validated_data['nom_cours'],
            nom_enseignant=validated_data['nom_enseignant'],
            niveau=validated_data['niveau'],
            duree=validated_data['duree']
        )
