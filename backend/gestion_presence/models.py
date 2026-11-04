from django.db import models
from gestion_seance.models import Seance
from gestion_utilisateur.models import CustomUser


class Presence(models.Model):
    seance = models.ForeignKey(Seance, on_delete = models.CASCADE, related_name='presences')
    étudiant = models.ForeignKey(CustomUser, on_delete = models.CASCADE, related_name='presences')
    timestamp = models.DateTimeField(auto_now_add=True)


    class Meta:
        constraints=[
             models.UniqueConstraint(
                fields=['seance', 'étudiant'],
                name='unique_presence_par_seance',
            )
        ]
        ordering = ['-timestamp']
        verbose_name = "Presence"
        verbose_name_plural = "Presences"


    def __str__(self):
        return f"{self.étudiant}-{self.seance}"
    


