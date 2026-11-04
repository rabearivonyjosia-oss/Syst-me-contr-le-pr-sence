"""Mod\u00e8le des cours et des inscriptions d'\u00e9tudiants."""

from django.db import models

from gestion_utilisateur.models import CustomUser


class cours(models.Model):
    """Cours dispens\u00e9 par un enseignant \u00e0 un groupe d'\u00e9tudiants."""

    NIVEAU_CHOICES = CustomUser.Niveau.choices

    nom_cours = models.CharField(max_length=120)
    enseignant = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="cours_enseignant",
        limit_choices_to={"role": CustomUser.Role.ENSEIGNANT},
    )
    etudiants = models.ManyToManyField(
        CustomUser,
        blank=True,
        related_name="cours_suivis",
        limit_choices_to={"role": CustomUser.Role.ETUDIANT},
    )
    niveau = models.CharField(
        max_length=2,
        choices=NIVEAU_CHOICES,
        default=CustomUser.Niveau.L1,
    )
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["nom_cours"]
        verbose_name = "Cours"
        verbose_name_plural = "Cours"

    def __str__(self):
        return f"{self.nom_cours} ({self.get_niveau_display()})"

    @property
    def nb_etudiants(self):
        return self.etudiants.count()

    @property
    def nb_seances(self):
        return self.seances.count()

