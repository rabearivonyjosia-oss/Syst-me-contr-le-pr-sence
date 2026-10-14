from rest_framework import serializers
from .models import Seance
from gestion_cours.models import cours


class SeanceSerializers(serializers.ModelSerializer):

    class Meta:
        model = Seance
        fields =[
            'id',
            'cours',
            'date_seance',
            'heure_debut',
            'heure_fin',
            'token_qr',
            'expiration_qr',
        ]
        read_only_fields = [
            'id',
            'token_qr', 
            'expiration_qr'
        ] 

