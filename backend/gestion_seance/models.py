from django.db import models
from gestion_cours.models import cours
import secrets
from datetime import timedelta
from django.utils import timezone

VALIDITI_QR_SECONDS = 60

class Seance(models.Model):
    cours = models.ForeignKey(cours, on_delete= models.CASCADE, related_name= "seance", blank=True, null=True )
    date_seance = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    token_qr = models.CharField(max_length=100,unique=True, default=secrets.token_urlsafe, editable=False)
    expiration_qr= models.DateTimeField(null=True, blank=True)


    def est_en_cours(self):
        maintenant = timezone.localtime()
        return (
            self.date_seance == maintenant.date()
            and self.heure_debut <= maintenant.time() < self.heure_fin
        )


    def cree_qr_temporaire(self):
        maintenant = timezone.localtime()
        if self.date_seance != maintenant.date():
            raise ValueError("Le QR code ne peut être généré que le jour de la séance.")
        if not (self.heure_debut <= maintenant.time() < self.heure_fin):
            raise ValueError("La séance n'est pas en cours.")

        self.token_qr = secrets.token_urlsafe(32)
        self.expiration_qr = timezone.now() + timedelta(seconds=VALIDITE_QR_SECONDES)
        self.save(update_fields=["token_qr", "expiration_qr"])
        return self.token_qr

    def qr_est_valide(self):
        return self.expiration_qr is not None and timezone.now() < self.expiration_qr
       
    
    def __str__(self):
        return f"{self.cours} - {self.date_seance}"

    