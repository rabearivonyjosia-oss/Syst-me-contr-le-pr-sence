from django.shortcuts import render
from .models import users , Etudiant , Enseignant 

# Create your views here.
def list_users(request):
    users = users.objects.all()
    return render(request, 'users.html', {'users': users})

def list_Etudiants(request):
    etudiants = Etudiant.objects.all(statut='Etudiant')
    return render(request, 'Etudiant.html', {'Etudiants': etudiants})

def list_Enseignants(request):
    Enseignants = Enseignant.objects.all(statut='Enseignant')
    return render(request, 'Enseignant.html', {'Enseignants': Enseignants})
