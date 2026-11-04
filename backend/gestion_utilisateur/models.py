"""Mod\u00e8le utilisateur personnalis\u00e9 : r\u00f4les, niveau et matricule."""

from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Utilisateur de la plateforme (administrateur, enseignant ou \u00e9tudiant)."""

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrateur"
        ENSEIGNANT = "ENSEIGNANT", "Enseignant"
        ETUDIANT = "ETUDIANT", "\u00c9tudiant"

    class Niveau(models.TextChoices):
        L1 = "L1", "Licence 1"
        L2 = "L2", "Licence 2"
        L3 = "L3", "Licence 3"
        M1 = "M1", "Master 1"
        M2 = "M2", "Master 2"

    email = models.EmailField(unique=True)
    num_matricule = models.CharField(max_length=20, unique=True, blank=True, null=True)
    niveau = models.CharField(
        max_length=2,
        choices=Niveau.choices,
        blank=True,
        null=True,
        help_text="Niveau d'\u00e9tude (uniquement pour les \u00e9tudiants).",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ETUDIANT,
        help_text="R\u00f4le applicatif : d\u00e9termine les \u00e9crans accessibles.",
    )
    telephone = models.CharField(max_length=30, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering = ["username"]
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return self.nom_complet

    @property
    def nom_complet(self):
        complet = f"{self.first_name} {self.last_name}".strip()
        return complet or self.username or self.email

    @property
    def est_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def est_enseignant(self):
        return self.role == self.Role.ENSEIGNANT

    @property
    def est_etudiant(self):
        return self.role == self.Role.ETUDIANT
