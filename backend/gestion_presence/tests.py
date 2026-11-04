"""Tests d'intégration : parcours enseignant → étudiant, QR, présences, stats."""

import json
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from gestion_cours.models import cours
from gestion_seance.models import Seance

from .models import Presence

Utilisateur = get_user_model()
MOT_DE_PASSE = "MotDePasse2026!"


@override_settings(
    PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"]
)
class BaseAPITest(APITestCase):
    def creer_utilisateur(self, email, role, **extra):
        return Utilisateur.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password=MOT_DE_PASSE,
            role=role,
            **extra,
        )

    def connecter(self, utilisateur):
        # Authentification directe : évite de saturer la limitation de débit
        # de connexion quand une suite de tests enchaîne les scénarios.
        self.client.force_authenticate(user=utilisateur)


class AuthentificationTests(BaseAPITest):
    def setUp(self):
        self.etudiant = self.creer_utilisateur(
            "etudiant@test.local", "ETUDIANT", niveau="L2", num_matricule="ETU-1"
        )

    def test_connexion_renvoie_role_et_profil(self):
        reponse = self.client.post(
            "/api/auth/login/",
            data=json.dumps({"email": self.etudiant.email, "password": MOT_DE_PASSE}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 200)
        jetons = reponse.json()
        self.assertIn("access", jetons)
        self.assertIn("refresh", jetons)
        self.assertEqual(jetons["user"]["role"], "ETUDIANT")

    def test_connexion_invalide_format_erreur_uniforme(self):
        reponse = self.client.post(
            "/api/auth/login/",
            data=json.dumps({"email": self.etudiant.email, "password": "faux"}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, status.HTTP_401_UNAUTHORIZED)
        corps = reponse.json()
        self.assertIn("detail", corps)
        self.assertIn("errors", corps)
        self.assertIn("code", corps)

    def test_me_est_protege(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)
        self.connecter(self.etudiant)
        reponse = self.client.get("/api/auth/me/")
        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(reponse.json()["role"], "ETUDIANT")

    def test_inscription_etudiant(self):
        reponse = self.client.post(
            "/api/auth/register/",
            data=json.dumps(
                {
                    "username": "nouveau",
                    "email": "nouveau@test.local",
                    "password": "MotDePasse2026!",
                    "password_confirm": "MotDePasse2026!",
                    "niveau": "L1",
                    "num_matricule": "ETU-99",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 201)
        self.assertEqual(reponse.json()["user"]["role"], "ETUDIANT")

    def test_inscription_refuse_mot_de_passe_different(self):
        reponse = self.client.post(
            "/api/auth/register/",
            data=json.dumps(
                {
                    "username": "nouveau",
                    "email": "nouveau@test.local",
                    "password": "MotDePasse2026!",
                    "password_confirm": "AutreMotDePasse2026!",
                    "niveau": "L1",
                    "num_matricule": "ETU-99",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 400)
        self.assertIn("password_confirm", reponse.json()["errors"])

    def test_changement_mot_de_passe(self):
        self.connecter(self.etudiant)
        reponse = self.client.post(
            "/api/auth/change-password/",
            data=json.dumps(
                {
                    "current_password": MOT_DE_PASSE,
                    "new_password": "NouveauMotDePasse2026!",
                    "confirm_password": "NouveauMotDePasse2026!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 200)
        self.etudiant.refresh_from_db()
        self.assertTrue(self.etudiant.check_password("NouveauMotDePasse2026!"))


class CoursTests(BaseAPITest):
    def setUp(self):
        self.enseignant = self.creer_utilisateur("enseignant@test.local", "ENSEIGNANT")
        self.autre = self.creer_utilisateur("autre@test.local", "ENSEIGNANT")
        self.etudiant = self.creer_utilisateur(
            "etudiant@test.local", "ETUDIANT", niveau="L2", num_matricule="ETU-1"
        )

    def test_enseignant_cree_et_liste_ses_cours(self):
        self.connecter(self.enseignant)
        reponse = self.client.post(
            "/api/cours/",
            data=json.dumps({"nom_cours": "Réseaux", "niveau": "L2"}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 201, reponse.content)
        self.assertEqual(reponse.json()["enseignant"], self.enseignant.id)

        cours.objects.create(nom_cours="Cours d'un autre", niveau="L2", enseignant=self.autre)
        liste = self.client.get("/api/cours/")
        self.assertEqual(liste.json()["count"], 1)

    def test_etudiant_ne_peut_pas_creer_de_cours(self):
        self.connecter(self.etudiant)
        reponse = self.client.post(
            "/api/cours/",
            data=json.dumps({"nom_cours": "Intrusion", "niveau": "L2"}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 403)

    def test_enseignant_ne_peut_pas_modifier_le_cours_d_un_autre(self):
        cours_autre = cours.objects.create(
            nom_cours="Cours d'un autre", niveau="L2", enseignant=self.autre
        )
        self.connecter(self.enseignant)
        reponse = self.client.patch(
            f"/api/cours/{cours_autre.id}/",
            data=json.dumps({"nom_cours": "Détournement"}),
            content_type="application/json",
        )
        # Le cours d'un autre enseignant est invisible dans son périmètre : 404.
        self.assertEqual(reponse.status_code, 404)

    def test_inscription_des_etudiants(self):
        cours_cible = cours.objects.create(
            nom_cours="Web", niveau="L2", enseignant=self.enseignant
        )
        self.connecter(self.enseignant)
        reponse = self.client.post(
            f"/api/cours/{cours_cible.id}/etudiants/",
            data=json.dumps({"etudiant_ids": [self.etudiant.id]}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 200, reponse.content)
        self.assertTrue(cours_cible.etudiants.filter(id=self.etudiant.id).exists())


class SeanceTests(BaseAPITest):
    def setUp(self):
        self.enseignant = self.creer_utilisateur("enseignant@test.local", "ENSEIGNANT")
        self.autre = self.creer_utilisateur("autre@test.local", "ENSEIGNANT")
        self.cours = cours.objects.create(
            nom_cours="Web", niveau="L2", enseignant=self.enseignant
        )
        self.aujourd_hui = timezone.localdate() + timedelta(days=1)

    def donnees(self, debut="09:00", fin="11:00", salle="B12"):
        return {
            "cours": self.cours.id,
            "date_seance": self.aujourd_hui.isoformat(),
            "heure_debut": debut,
            "heure_fin": fin,
            "salle": salle,
            "type_seance": "CM",
        }

    def test_creation_valide(self):
        self.connecter(self.enseignant)
        reponse = self.client.post(
            "/api/seances/",
            data=json.dumps(self.donnees()),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 201, reponse.content)
        self.assertEqual(reponse.json()["statut"], "A_VENIR")

    def test_fin_avant_debut_refusee(self):
        self.connecter(self.enseignant)
        reponse = self.client.post(
            "/api/seances/",
            data=json.dumps(self.donnees(debut="11:00", fin="09:00")),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 400)
        self.assertIn("heure_fin", reponse.json()["errors"])

    def test_chevauchement_refuse(self):
        Seance.objects.create(
            cours=self.cours,
            date_seance=self.aujourd_hui,
            heure_debut="09:00",
            heure_fin="11:00",
            salle="B12",
        )
        self.connecter(self.enseignant)
        reponse = self.client.post(
            "/api/seances/",
            data=json.dumps(self.donnees(debut="10:00", fin="12:00")),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 400)

    def test_seance_sur_cours_d_un_autre_refusee(self):
        cours_autre = cours.objects.create(
            nom_cours="Autre", niveau="L2", enseignant=self.autre
        )
        self.connecter(self.enseignant)
        donnees = self.donnees()
        donnees["cours"] = cours_autre.id
        reponse = self.client.post(
            "/api/seances/",
            data=json.dumps(donnees),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 400)


class ParcoursPresenceTests(BaseAPITest):
    """Enseignant crée une séance et génère le QR, étudiant scanne, présence visible."""

    def setUp(self):
        self.enseignant = self.creer_utilisateur("enseignant@test.local", "ENSEIGNANT")
        self.etudiant = self.creer_utilisateur(
            "etudiant@test.local", "ETUDIANT", niveau="L2", num_matricule="ETU-1"
        )
        self.externe = self.creer_utilisateur(
            "externe@test.local", "ETUDIANT", niveau="L3", num_matricule="ETU-2"
        )
        self.cours = cours.objects.create(
            nom_cours="Web", niveau="L2", enseignant=self.enseignant
        )
        self.cours.etudiants.add(self.etudiant)
        maintenant = timezone.localtime()
        self.seance = Seance.objects.create(
            cours=self.cours,
            date_seance=maintenant.date(),
            heure_debut=(maintenant - timedelta(minutes=10)).time(),
            heure_fin=(maintenant + timedelta(minutes=50)).time(),
            salle="B12",
            type_seance="CM",
        )

    def generer_qr(self):
        self.connecter(self.enseignant)
        reponse = self.client.post(f"/api/seances/{self.seance.id}/qr/")
        self.assertEqual(reponse.status_code, 201, reponse.content)
        return reponse.json()["qr_payload"]

    def test_parcours_complet(self):
        payload = self.generer_qr()
        self.connecter(self.etudiant)
        scan = self.client.post(
            "/api/presences/scan/",
            data=json.dumps({"token": payload}),
            content_type="application/json",
        )
        self.assertEqual(scan.status_code, 201, scan.content)
        self.assertEqual(scan.json()["presence"]["statut"], "PRESENT")

        self.connecter(self.enseignant)
        feuille = self.client.get(f"/api/seances/{self.seance.id}/presences/")
        self.assertEqual(feuille.status_code, 200)
        self.assertEqual(feuille.json()["resume"]["presents"], 1)

        stats = self.client.get("/api/stats/")
        self.assertEqual(stats.status_code, 200)
        self.assertEqual(stats.json()["resume"]["presents"], 1)

        export = self.client.get("/api/exports/presences/")
        self.assertEqual(export.status_code, 200)
        self.assertTrue(export.content.startswith(b"\xef\xbb\xbf"))

    def test_double_scan_refuse(self):
        payload = self.generer_qr()
        self.connecter(self.etudiant)
        self.client.post(
            "/api/presences/scan/",
            data=json.dumps({"token": payload}),
            content_type="application/json",
        )
        second = self.client.post(
            "/api/presences/scan/",
            data=json.dumps({"token": payload}),
            content_type="application/json",
        )
        self.assertEqual(second.status_code, 409)
        self.assertEqual(second.json()["code"], "deja_present")
        self.assertEqual(Presence.objects.count(), 1)

    def test_etudiant_non_inscrit_refuse(self):
        payload = self.generer_qr()
        self.connecter(self.externe)
        reponse = self.client.post(
            "/api/presences/scan/",
            data=json.dumps({"token": payload}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 403)
        self.assertEqual(reponse.json()["code"], "non_inscrit")

    def test_qr_expire(self):
        self.seance.token_qr = "jeton-expire"
        self.seance.expiration_qr = timezone.now() - timedelta(seconds=5)
        self.seance.save(update_fields=["token_qr", "expiration_qr"])
        self.connecter(self.etudiant)
        reponse = self.client.post(
            "/api/presences/scan/",
            data=json.dumps({"token": f"PQR:{self.seance.id}:jeton-expire"}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 410)
        self.assertEqual(reponse.json()["code"], "qr_expire")

    def test_qr_invalide(self):
        self.connecter(self.etudiant)
        reponse = self.client.post(
            "/api/presences/scan/",
            data=json.dumps({"token": "PQR:999999:nimportequoi"}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 404)
        self.assertEqual(reponse.json()["code"], "qr_invalide")

    def test_seance_non_ouverte(self):
        maintenant = timezone.localtime()
        future = Seance.objects.create(
            cours=self.cours,
            date_seance=maintenant.date(),
            heure_debut=(maintenant + timedelta(hours=2)).time(),
            heure_fin=(maintenant + timedelta(hours=3)).time(),
            salle="B12",
        )
        self.connecter(self.etudiant)
        reponse = self.client.post(
            "/api/presences/scan/",
            data=json.dumps({"token": f"PQR:{future.id}:{future.token_qr}"}),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 409)
        self.assertEqual(reponse.json()["code"], "seance_non_ouverte")

    def test_correction_manuelle_avec_trace(self):
        self.connecter(self.enseignant)
        reponse = self.client.post(
            f"/api/seances/{self.seance.id}/presences/",
            data=json.dumps(
                {
                    "etudiant": self.etudiant.id,
                    "statut": "JUSTIFIE",
                    "motif_justification": "Certificat médical",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(reponse.status_code, 201, reponse.content)
        presence = Presence.objects.get(seance=self.seance, etudiant=self.etudiant)
        self.assertEqual(presence.source, Presence.Source.MANUEL)
        self.assertEqual(presence.modifie_par, self.enseignant)

    def test_export_vide_signale_clairement(self):
        self.connecter(self.enseignant)
        reponse = self.client.get(
            "/api/exports/presences/", {"date_debut": "2000-01-01", "date_fin": "2000-01-02"}
        )
        self.assertEqual(reponse.status_code, 404)
        self.assertEqual(reponse.json()["code"], "export_vide")
