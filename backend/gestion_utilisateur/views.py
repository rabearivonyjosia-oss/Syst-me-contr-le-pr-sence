from django.shortcuts import render
from rest_framework import generics
from .serializers import RegisterSerializer

class RegisterViews(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    



 