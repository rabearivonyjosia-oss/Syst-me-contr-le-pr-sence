from django.db import models

# Create your models here.

class users(models.Model):
    nom = models.CharField(max_length=100)
    email = models.EmailField()
    statut = models.CharField(max_length=20)
    
    
    def __str__(self):
        return self.nom

# les table etudeiant
class Etudiant(models.Model):
    user = models.OneToOneField(users, on_delete=models.CASCADE , related_name='Etudiant')
    niveau = models.CharField(max_length=100)
    num_matricule = models.CharField(max_length=100)

    def __str__(self):
        return self.user.nom


class Enseignant(models.Model):
    user = models.OneToOneField(users, on_delete=models.CASCADE , related_name='enseignant')
    matiere = models.CharField(max_length=100)

    def __str__(self):
        return self.user.nom



