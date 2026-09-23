from django.db import models


# Create le modela des cours des eleves par les professeurs
class cours(models.Model):
    nom_cours = models.CharField(max_length=100);
    
    
    