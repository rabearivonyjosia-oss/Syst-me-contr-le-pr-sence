from django.shortcuts import render
from rest_framework import generics
from .serialiers import RegisterSerializers

class RegisterView(generics.CreateAPIViews):
    serializer_class =RegisterSerializers
    



