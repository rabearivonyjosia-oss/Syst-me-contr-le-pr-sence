from django.db import models
from gestion_cours.models import cours
import secrets
from datetime import timedelta
from django.utils import timezone

class Seance(models.Model):
    cours = models.ForeignKey(cours, on_delete= models.CASCADE, related_name= "seance", blank=True, null=True )
    date_seance = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    token_qr = models.CharField(max_length=100,unique=True, default=secrets.token_urlsafe, editable=False)
    expiration_qr= models.DateTimeField(null=True, blank=True)

    def creer_qr_temporaire(self):
        self.token_qr = secrets.token_urlsafe()
        self.expiration_qr = timezone.now() + timedelta(minutes=2)
        self.save()


    def __str__(self):
        return self.date_seance

    