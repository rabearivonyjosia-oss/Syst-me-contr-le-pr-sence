from django.shortcuts import render
from .models import users , Etudiant , Enseignant 
from .serializers import usersSerializers, EtudiantSerializers, EnseignantSerializers
# Crud : read no ato
def list_users(request):
    users = users.objects.all()
    return render(request, 'users.html', {'users': users})

def list_etudiants(request):
    etudiants = Etudiant.objects.filter(statut='Etudiant')
    return render(request, 'Etudiant.html', {'Etudiants': etudiants})

def list_enseignants(request):
    Enseignants = Enseignant.objects.filter(statut='Enseignant')
    return render(request, 'Enseignant.html', {'Enseignants': Enseignants})

# CRUD: creat un utilisateur , enseignant et etudiant

def creat_users(request):
    return render(request,"")

def creat_etudiant(request):
    return render(request,"")

def creat_enseignant(request):
    return render(request,"")

#CRUD: update ou modifier les utilisateur

def put_users(request, id):
    return render(request)

def put_etudiant(request, id):
    return render(request, "")

def put_enseignant(request, id):
    return render(request, "")

#CRUD: supprimer un des utilisateur

def Delete_etudiant(request, id):
    return render(request,"")

def Delete_enseignant(request):
    return render(request,"")
