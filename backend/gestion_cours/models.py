from django.db import models
from gestion_utilisateur.models import CustomUser


# Create le modela des cours des eleves par les professeurs
class cours(models.Model):
     
    NIVEAU_CHOICES = [
        ('Licence 1', 'L1'),
        ('Licence 2', 'L2'),
        ('Licence 3', 'L3'),
        ('Master 1', 'M1'),
        ('Master 2', 'M2'),
    ]

    nom_cours = models.CharField(max_length=100);
    nom_enseignant = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='cours_enseignant', blank=True, null=True);
    niveau = models.CharField(max_length=50, choices=NIVEAU_CHOICES, default='Licence 1', blank=True, null=True);
    date_creation = models.DateTimeField(auto_now_add=True);
    

    

def __str__(self):
    return f"{self.nom_cours} - {self.nom_enseignant} - {self.niveau}"

    
    