from django.shortcuts import render
from .serializers import SeanceSerializers
from rest_framework import generics
from .models import Seance
from datetime import timedelta
from django.utils import timezone
# Create your views here.

class Seanceviews(generics.ListCreateAPIView):
    queryset = Seance.objects.all()
    serializer_class = SeanceSerializers


    def perform_Creat(self, serializers):
         # Enregistrer la séance
        seance = serializer.save()

        # Générer le token et définir son expiration
        seance.creer_qr_temporaire()