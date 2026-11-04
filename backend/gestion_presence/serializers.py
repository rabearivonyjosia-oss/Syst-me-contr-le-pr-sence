from rest_framework import serializers
from .models import Presence
from gestion_seance.models import Seance


class PresenceSerializers(serializers.ModelSerializer):

    class Meta:
        models = Presence
        field = [
            'id',
            'Seance',
            'timestamp',
        ]
        read_only_field = ['id', 'timestamp']

    def validate_presence(self, attrs):
        etudiant = self.context['request'].user
        if Presence.objects.filter(seance=attrs['seance'], etudiant=etudiant).exists():
            raise serializers.ValidationError("Présence déjà enregistrée pour cette séance.")
        return attrs

    def create(self, validated_data):
        validated_data['etudiant'] = self.context['request'].user
        return super().create(validated_data)


        

