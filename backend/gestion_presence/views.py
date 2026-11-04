from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Presence
from .serializers import PresenceSerializers


class PresenceViews(generics.ListCreateAPIView):
    serializer_class = PresenceSerializers
    permission_classes = [IsAuthenticated]


# 2. Consulter, modifier ou supprimer une présence
class PresenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Presence.objects.all()
    serializer_class = PresenceSerializers
    permission_classes = [IsAuthenticated]



