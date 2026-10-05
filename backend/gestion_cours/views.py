from django.shortcuts import render
from rest_framework import generics
from django.http import HttpResponse
from .models import cours
from .serializers import coursSerializer

# Create your views here.
class coursViews(generics.ListCreateAPIView):
    queryset = cours.objects.all()
    serializer_class = coursSerializer

def perform_create(self, serializer):
    serializer.save(nom_enseignant=self.request.user)



