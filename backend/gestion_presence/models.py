"""Pr\u00e9sences : une ligne par \u00e9tudiant et par s\u00e9ance, avec statut et trace."""

from django.db import models

from gestion_seance.models import Seance
from gestion_utilisateur.models import CustomUser


class Presence(models.Model):
    """Statut de pr\u00e9sence d'un \u00e9tudiant \u00e0 une s\u00e9ance."""

    class Statut(models.TextChoices):
        PRESENT = "PRESENT", "Pr\u00e9sent"
        ABSENT = "ABSENT", "Absent"
        JUSTIFIE = "JUSTIFIE", "Justifi\u00e9"

    class Source(models.TextChoices):
        SCAN = "SCAN", "Scan du QR code"
        MANUEL = "MANUEL", "Correction manuelle"

    seance = models.ForeignKey(
        Seance, on_delete=models.CASCADE, related_name="presences"
    )
    etudiant = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="presences"
    )
    statut = models.CharField(
        max_length=10,
        choices=Statut.choices,
        default=Statut.PRESENT,
    )
    motif_justification = models.CharField(max_length=255, blank=True)
    source = models.CharField(
        max_length=10,
        choices=Source.choices,
        default=Source.SCAN,
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    modifie_par = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="presences_modifiees",
    )
    modifie_le = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["etudiant__username"]
        verbose_name = "Pr\u00e9sence"
        verbose_name_plural = "Pr\u00e9sences"
        constraints = [
            models.UniqueConstraint(
                fields=["seance", "etudiant"],
                name="unique_presence_par_seance",
            )
        ]

    def __str__(self):
        return f"{self.etudiant} \u2013 {self.seance} : {self.get_statut_display()}"
