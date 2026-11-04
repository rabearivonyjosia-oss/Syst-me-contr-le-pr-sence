"""Jeu de démonstration reproductible (comptes, cours, séances, présences)."""

from datetime import time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from gestion_cours.models import cours
from gestion_presence.models import Presence
from gestion_seance.models import Seance

Utilisateur = get_user_model()
MOT_DE_PASSE = "Demo2026!"

ETUDIANTS = [
    ("etudiant@presence.local", "Aminata", "Diallo", "L2", "ETU-2026-001"),
    ("moussa@presence.local", "Moussa", "Ndiaye", "L2", "ETU-2026-002"),
    ("fatou@presence.local", "Fatou", "Sarr", "L2", "ETU-2026-003"),
    ("ibrahima@presence.local", "Ibrahima", "Fall", "L2", "ETU-2026-004"),
    ("aissatou@presence.local", "Aïssatou", "Ba", "L2", "ETU-2026-005"),
    ("oumar@presence.local", "Oumar", "Gueye", "L1", "ETU-2026-006"),
    ("mariama@presence.local", "Mariama", "Sow", "L1", "ETU-2026-007"),
]


class Command(BaseCommand):
    help = "Crée un jeu de données de démonstration (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--sans-presences",
            action="store_true",
            help="Ne crée pas les présences des séances passées.",
        )

    def handle(self, *args, **options):
        maintenant = timezone.localtime()
        aujourd_hui = maintenant.date()

        # --- Comptes ---------------------------------------------------
        admin = self._utilisateur(
            "admin@presence.local",
            "Admin",
            "Présence",
            "ADMIN",
            None,
            None,
            is_superuser=True,
            is_staff=True,
        )
        enseignant = self._utilisateur(
            "enseignant@presence.local",
            "Awa",
            "Diop",
            "ENSEIGNANT",
            None,
            None,
        )
        enseignant2 = self._utilisateur(
            "enseignant2@presence.local",
            "Cheikh",
            "Mbaye",
            "ENSEIGNANT",
            None,
            None,
        )
        etudiants = [
            self._utilisateur(email, prenom, nom, "ETUDIANT", niveau, matricule)
            for email, prenom, nom, niveau, matricule in ETUDIANTS
        ]

        # --- Cours -----------------------------------------------------
        cours_web = self._cours("Développement web", "L2", enseignant)
        cours_bdd = self._cours("Bases de données", "L2", enseignant)
        cours_algo = self._cours("Algorithmique", "L1", enseignant2)
        cours_web.etudiants.set([e for e in etudiants if e.niveau == "L2"])
        cours_bdd.etudiants.set([e for e in etudiants if e.niveau == "L2"])
        cours_algo.etudiants.set([e for e in etudiants if e.niveau == "L1"])

        # --- Séances ---------------------------------------------------
        seance_en_cours = self._seance(
            cours_web,
            aujourd_hui,
            (maintenant - timedelta(minutes=20)).time().replace(second=0, microsecond=0),
            (maintenant + timedelta(minutes=40)).time().replace(second=0, microsecond=0),
            "Salle B12",
            Seance.TypeSeance.CM,
        )
        self._seance(
            cours_bdd,
            aujourd_hui,
            time(16, 0),
            time(18, 0),
            "Salle C04",
            Seance.TypeSeance.TP,
        )
        self._seance(
            cours_web,
            aujourd_hui + timedelta(days=1),
            time(9, 0),
            time(11, 0),
            "Salle B12",
            Seance.TypeSeance.TD,
        )
        seance_passee = self._seance(
            cours_web,
            aujourd_hui - timedelta(days=1),
            time(9, 0),
            time(11, 0),
            "Salle B12",
            Seance.TypeSeance.CM,
        )
        seance_passee_bdd = self._seance(
            cours_bdd,
            aujourd_hui - timedelta(days=2),
            time(14, 0),
            time(16, 0),
            "Salle C04",
            Seance.TypeSeance.TP,
        )

        # --- Présences -------------------------------------------------
        if not options["sans_presences"]:
            inscrits_web = list(cours_web.etudiants.all())
            for index, etudiant in enumerate(inscrits_web):
                if index < 3:
                    statut = Presence.Statut.PRESENT
                elif index == 3:
                    statut = Presence.Statut.JUSTIFIE
                else:
                    continue
                Presence.objects.get_or_create(
                    seance=seance_passee,
                    etudiant=etudiant,
                    defaults={
                        "statut": statut,
                        "source": Presence.Source.MANUEL,
                        "motif_justification": (
                            "Certificat médical" if statut == Presence.Statut.JUSTIFIE else ""
                        ),
                        "modifie_par": enseignant,
                    },
                )
            inscrits_bdd = list(cours_bdd.etudiants.all())
            for index, etudiant in enumerate(inscrits_bdd):
                Presence.objects.get_or_create(
                    seance=seance_passee_bdd,
                    etudiant=etudiant,
                    defaults={
                        "statut": (
                            Presence.Statut.PRESENT
                            if index < 2
                            else Presence.Statut.ABSENT
                        ),
                        "source": Presence.Source.MANUEL,
                        "modifie_par": enseignant,
                    },
                )

        # QR prêt pour la démonstration si la séance est ouverte.
        try:
            seance_en_cours.generer_qr()
        except ValueError:
            pass

        self.stdout.write(self.style.SUCCESS("Jeu de démonstration prêt."))
        self.stdout.write("")
        self.stdout.write("Comptes (mot de passe : Demo2026!)")
        for compte in (admin, enseignant, enseignant2, etudiants[0], etudiants[-1]):
            self.stdout.write(
                f"  - {compte.email:<28} {compte.role:<10} {compte.nom_complet}"
            )
        self.stdout.write("")
        self.stdout.write(
            f"Séance en cours : {seance_en_cours.cours.nom_cours} "
            f"({seance_en_cours.heure_debut:%H:%M} – {seance_en_cours.heure_fin:%H:%M})"
        )

    # --- Aides ---------------------------------------------------------
    def _utilisateur(
        self, email, prenom, nom, role, niveau, matricule, **extra
    ):
        utilisateur, _ = Utilisateur.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0],
                "first_name": prenom,
                "last_name": nom,
                "role": role,
                "niveau": niveau,
                "num_matricule": matricule,
                **extra,
            },
        )
        utilisateur.first_name = prenom
        utilisateur.last_name = nom
        utilisateur.role = role
        utilisateur.niveau = niveau
        utilisateur.num_matricule = matricule
        for cle, valeur in extra.items():
            setattr(utilisateur, cle, valeur)
        utilisateur.set_password(MOT_DE_PASSE)
        utilisateur.save()
        return utilisateur

    def _cours(self, nom, niveau, enseignant):
        cours_cible, _ = cours.objects.get_or_create(
            nom_cours=nom,
            niveau=niveau,
            defaults={"enseignant": enseignant},
        )
        if cours_cible.enseignant_id != enseignant.id:
            cours_cible.enseignant = enseignant
            cours_cible.save(update_fields=["enseignant"])
        return cours_cible

    def _seance(self, cours_cible, date, debut, fin, salle, type_seance):
        seance, _ = Seance.objects.get_or_create(
            cours=cours_cible,
            date_seance=date,
            heure_debut=debut,
            defaults={
                "heure_fin": fin,
                "salle": salle,
                "type_seance": type_seance,
            },
        )
        return seance
