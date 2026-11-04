"""Mod\u00e8le des s\u00e9ances et gestion du jeton QR temporaire."""

import secrets
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from gestion_cours.models import cours

# Dur\u00e9e de vie d'un QR code, renouvelable par l'enseignant.
VALIDITE_QR_SECONDES = getattr(settings, "QR_TTL_SECONDS", 60)
# Marge avant le d\u00e9but de la s\u00e9ance pour projeter le QR (l'\u00e9margement, lui,
# n'est accept\u00e9 qu'\u00e0 partir de l'heure de d\u00e9but).
MARGE_OUVERTURE_QR_MINUTES = 10


class Seance(models.Model):
    """S\u00e9ance planifi\u00e9e pour un cours."""

    class TypeSeance(models.TextChoices):
        CM = "CM", "Cours magistral"
        TD = "TD", "Travaux dirig\u00e9s"
        TP = "TP", "Travaux pratiques"
        EXAMEN = "EXAMEN", "Examen"

    class Statut(models.TextChoices):
        A_VENIR = "A_VENIR", "\u00c0 venir"
        EN_COURS = "EN_COURS", "En cours"
        TERMINEE = "TERMINEE", "Termin\u00e9e"

    cours = models.ForeignKey(cours, on_delete=models.CASCADE, related_name="seances")
    date_seance = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    salle = models.CharField(max_length=50, blank=True)
    type_seance = models.CharField(
        max_length=10,
        choices=TypeSeance.choices,
        default=TypeSeance.CM,
    )
    token_qr = models.CharField(
        max_length=100,
        unique=True,
        default=secrets.token_urlsafe,
        editable=False,
    )
    expiration_qr = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["date_seance", "heure_debut"]
        verbose_name = "S\u00e9ance"
        verbose_name_plural = "S\u00e9ances"
        indexes = [
            models.Index(fields=["date_seance", "heure_debut"]),
            models.Index(fields=["cours", "date_seance"]),
        ]

    def __str__(self):
        return f"{self.cours.nom_cours} \u2013 {self.date_seance:%d/%m/%Y} {self.heure_debut:%H:%M}"

    # --- Statut -------------------------------------------------------
    def _maintenant(self):
        return timezone.localtime()

    def statut(self):
        maintenant = self._maintenant()
        if self.date_seance > maintenant.date():
            return self.Statut.A_VENIR
        if self.date_seance < maintenant.date():
            return self.Statut.TERMINEE
        if maintenant.time() < self.heure_debut:
            return self.Statut.A_VENIR
        if maintenant.time() >= self.heure_fin:
            return self.Statut.TERMINEE
        return self.Statut.EN_COURS

    @property
    def statut_libelle(self):
        return self.Statut(self.statut()).label

    def est_en_cours(self):
        return self.statut() == self.Statut.EN_COURS

    # --- QR ------------------------------------------------------------
    def _debut_projection(self):
        debut = timezone.datetime.combine(self.date_seance, self.heure_debut)
        return timezone.make_aware(
            debut - timedelta(minutes=MARGE_OUVERTURE_QR_MINUTES),
            timezone.get_current_timezone(),
        )

    def _fin_projection(self):
        fin = timezone.datetime.combine(self.date_seance, self.heure_fin)
        return timezone.make_aware(fin, timezone.get_current_timezone())

    def peut_generer_qr(self):
        """Le QR est projetable de 10 min avant le d\u00e9but jusqu'\u00e0 la fin."""
        maintenant = timezone.now()
        return self._debut_projection() <= maintenant < self._fin_projection()

    def generer_qr(self):
        """Renouvelle le jeton et son expiration. L\u00e8ve ValueError si hors fen\u00eatre."""
        if not self.peut_generer_qr():
            raise ValueError(
                "Le QR code ne peut \u00eatre g\u00e9n\u00e9r\u00e9 que le jour de la s\u00e9ance, "
                "de 10 minutes avant le d\u00e9but jusqu'\u00e0 la fin."
            )
        self.token_qr = secrets.token_urlsafe(16)
        self.expiration_qr = timezone.now() + timedelta(seconds=VALIDITE_QR_SECONDES)
        self.save(update_fields=["token_qr", "expiration_qr"])
        return self.token_qr

    def qr_est_valide(self):
        return bool(
            self.token_qr
            and self.expiration_qr
            and timezone.now() < self.expiration_qr
        )

    def secondes_restantes_qr(self):
        if not self.expiration_qr:
            return 0
        return max(0, int((self.expiration_qr - timezone.now()).total_seconds()))

