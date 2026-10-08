from rest_framework import serializers
from .models import cours

#regiter pour les cours crée

class coursSerializer(serializers.ModelSerializer):
    class Meta:
        model = cours
        fields = [
            'id',
            'nom_cours',
            'nom_enseignant',
            'niveau',
            
        ]
        read_only_fields= ["nom_enseignant","date_creation"]

    def create(self, validated_data):

        request=self.context['request']

        cours = cours.objects.create(
            nom_cours=validated_data['nom_cours'],
            nom_enseignant=request.user['nom_enseignant'],
            niveau=validated_data['niveau'],
        )
        return cours_cree
