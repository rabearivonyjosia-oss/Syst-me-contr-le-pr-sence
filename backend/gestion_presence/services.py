"""Calculs de statistiques et de lignes d'export, partag\u00e9s par les vues."""

import csv
import io
from collections import defaultdict
from datetime import date

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone

from core.exceptions import ErreurMetier
from gestion_cours.models import cours
from gestion_seance.models import Seance

from .models import Presence

Utilisateur = get_user_model()


def _entier(valeur, nom):
    if valeur in (None, ""):
        return None
    try:
        return int(valeur)
    except (TypeError, ValueError):
        raise ErreurMetier(f"Le filtre \u00ab {nom} \u00bb est invalide.", "filtre_invalide")


def _date(valeur, nom):
    if valeur in (None, ""):
        return None
    try:
        return date.fromisoformat(valeur)
    except (TypeError, ValueError):
        raise ErreurMetier(
            f"Le filtre \u00ab {nom} \u00bb doit \u00eatre au format aaaa-mm-jj.",
            "filtre_invalide",
        )


def construire_perimetre(utilisateur, params):
    """Applique le p\u00e9rim\u00e8tre de r\u00f4le et les filtres demand\u00e9s."""
    requete_cours = cours.objects.all()
    if utilisateur.est_admin:
        pass
    elif utilisateur.est_enseignant:
        requete_cours = requete_cours.filter(enseignant=utilisateur)
    else:
        requete_cours = requete_cours.filter(etudiants=utilisateur)

    cours_id = _entier(params.get("cours"), "cours")
    if cours_id:
        requete_cours = requete_cours.filter(id=cours_id)

    requete_seances = Seance.objects.filter(cours__in=requete_cours).select_related(
        "cours", "cours__enseignant"
    )

    date_debut = _date(params.get("date_debut"), "date de d\u00e9but")
    date_fin = _date(params.get("date_fin"), "date de fin")
    if date_debut and date_fin and date_debut > date_fin:
        raise ErreurMetier(
            "La date de d\u00e9but doit pr\u00e9c\u00e9der la date de fin.",
            "filtre_invalide",
        )
    if date_debut:
        requete_seances = requete_seances.filter(date_seance__gte=date_debut)
    if date_fin:
        requete_seances = requete_seances.filter(date_seance__lte=date_fin)

    etudiant_id = _entier(params.get("etudiant"), "etudiant")
    if utilisateur.est_etudiant:
        etudiant_id = utilisateur.id
    elif etudiant_id:
        autorise = Utilisateur.objects.filter(
            id=etudiant_id,
            role=Utilisateur.Role.ETUDIANT,
            cours_suivis__in=requete_cours,
        ).exists()
        if not autorise:
            raise ErreurMetier(
                "Cet \u00e9tudiant ne fait pas partie de votre p\u00e9rim\u00e8tre.",
                "acces_refuse",
            )

    requete_presences = Presence.objects.filter(seance__in=requete_seances)
    if etudiant_id:
        requete_presences = requete_presences.filter(etudiant_id=etudiant_id)

    return {
        "utilisateur": utilisateur,
        "cours": requete_cours,
        "seances": requete_seances,
        "presences": requete_presences,
        "etudiant_id": etudiant_id,
        "date_debut": date_debut,
        "date_fin": date_fin,
        "cours_id": cours_id,
    }


def _etudiants_du_perimetre(perimetre):
    if perimetre["utilisateur"].est_etudiant:
        return Utilisateur.objects.filter(id=perimetre["utilisateur"].id)
    requete = Utilisateur.objects.filter(
        role=Utilisateur.Role.ETUDIANT,
        cours_suivis__in=perimetre["cours"],
    ).distinct()
    if perimetre["etudiant_id"]:
        requete = requete.filter(id=perimetre["etudiant_id"])
    return requete


def _statuts_par_cle(perimetre):
    return {
        (presence.seance_id, presence.etudiant_id): presence
        for presence in perimetre["presences"]
    }


def _resume(seances, presences, etudiant_id=None):
    """Compte les statuts pour un sous-ensemble de s\u00e9ances."""
    seances = list(seances)
    if etudiant_id:
        attendus = sum(
            1
            for seance in seances
            if seance.cours.etudiants.filter(id=etudiant_id).exists()
        )
    else:
        attendus = sum(seance.cours.etudiants.count() for seance in seances)

    presents = sum(
        1 for presence in presences if presence.statut == Presence.Statut.PRESENT
    )
    justifies = sum(
        1 for presence in presences if presence.statut == Presence.Statut.JUSTIFIE
    )
    absents = max(0, attendus - presents - justifies)
    taux = round((presents / attendus) * 100, 1) if attendus else 0
    return {
        "attendu": attendus,
        "presents": presents,
        "absents": absents,
        "justifies": justifies,
        "taux_presence": taux,
    }


def calculer_statistiques(utilisateur, params):
    perimetre = construire_perimetre(utilisateur, params)
    seances = list(perimetre["seances"].order_by("date_seance", "heure_debut"))
    presences = list(perimetre["presences"])
    etudiant_id = perimetre["etudiant_id"]
    aujourd_hui = timezone.localdate()

    global_resume = _resume(seances, presences, etudiant_id)
    etudiants = list(_etudiants_du_perimetre(perimetre))

    # --- Par cours -----------------------------------------------------
    seances_par_cours = defaultdict(list)
    for seance in seances:
        seances_par_cours[seance.cours_id].append(seance)
    presences_par_cours = defaultdict(list)
    for presence in presences:
        presences_par_cours[presence.seance.cours_id].append(presence)

    par_cours = []
    for cours_cible in perimetre["cours"].order_by("nom_cours"):
        cours_seances = seances_par_cours.get(cours_cible.id, [])
        cours_presences = presences_par_cours.get(cours_cible.id, [])
        resume = _resume(
            cours_seances,
            cours_presences,
            etudiant_id if etudiant_id else None,
        )
        par_cours.append(
            {
                "cours": cours_cible.id,
                "cours_nom": cours_cible.nom_cours,
                "niveau": cours_cible.niveau,
                "niveau_libelle": cours_cible.get_niveau_display(),
                "nb_seances": len(cours_seances),
                "nb_etudiants": (
                    1 if etudiant_id else cours_cible.etudiants.count()
                ),
                **resume,
            }
        )

    # --- Par \u00e9tudiant --------------------------------------------------
    presences_par_etudiant = defaultdict(list)
    for presence in presences:
        presences_par_etudiant[presence.etudiant_id].append(presence)

    par_etudiant = []
    for etudiant in etudiants:
        ses_seances = [
            seance
            for seance in seances
            if seance.cours.etudiants.filter(id=etudiant.id).exists()
        ]
        resume = _resume(
            ses_seances,
            presences_par_etudiant.get(etudiant.id, []),
            etudiant.id,
        )
        par_etudiant.append(
            {
                "etudiant": etudiant.id,
                "username": etudiant.username,
                "nom_complet": etudiant.nom_complet,
                "email": etudiant.email,
                "num_matricule": etudiant.num_matricule,
                "niveau": etudiant.niveau,
                "niveau_libelle": etudiant.get_niveau_display(),
                **resume,
            }
        )
    par_etudiant.sort(key=lambda ligne: (-ligne["taux_presence"], ligne["nom_complet"]))

    # --- Par p\u00e9riode ---------------------------------------------------
    seances_par_date = defaultdict(list)
    for seance in seances:
        seances_par_date[seance.date_seance].append(seance)
    presences_par_date = defaultdict(list)
    for presence in presences:
        presences_par_date[presence.seance.date_seance].append(presence)

    par_periode = []
    for jour in sorted(seances_par_date):
        resume = _resume(
            seances_par_date[jour],
            presences_par_date.get(jour, []),
            etudiant_id,
        )
        par_periode.append({"date": jour.isoformat(), **resume})

    return {
        "filtres": {
            "cours": perimetre["cours_id"],
            "etudiant": etudiant_id,
            "date_debut": perimetre["date_debut"].isoformat()
            if perimetre["date_debut"]
            else None,
            "date_fin": perimetre["date_fin"].isoformat()
            if perimetre["date_fin"]
            else None,
        },
        "resume": {
            "nb_cours": perimetre["cours"].count(),
            "nb_seances": len(seances),
            "nb_seances_aujourdhui": sum(
                1 for seance in seances if seance.date_seance == aujourd_hui
            ),
            "nb_etudiants": len(etudiants),
            **global_resume,
        },
        "par_cours": par_cours,
        "par_etudiant": par_etudiant,
        "par_periode": par_periode,
    }


def lignes_export(utilisateur, params):
    perimetre = construire_perimetre(utilisateur, params)
    etudiant_id = perimetre["etudiant_id"]
    presences = {
        (presence.seance_id, presence.etudiant_id): presence
        for presence in perimetre["presences"]
    }

    lignes = []
    for seance in perimetre["seances"].order_by("date_seance", "heure_debut"):
        etudiants = seance.cours.etudiants.all().order_by("username")
        if etudiant_id:
            etudiants = etudiants.filter(id=etudiant_id)
        for etudiant in etudiants:
            presence = presences.get((seance.id, etudiant.id))
            statut = presence.statut if presence else Presence.Statut.ABSENT
            lignes.append(
                {
                    "date": seance.date_seance.strftime("%d/%m/%Y"),
                    "heure_debut": seance.heure_debut.strftime("%H:%M"),
                    "heure_fin": seance.heure_fin.strftime("%H:%M"),
                    "cours": seance.cours.nom_cours,
                    "niveau": seance.cours.get_niveau_display(),
                    "salle": seance.salle,
                    "type": seance.get_type_seance_display(),
                    "etudiant": etudiant.nom_complet,
                    "email": etudiant.email,
                    "matricule": etudiant.num_matricule or "",
                    "statut": Presence.Statut(statut).label,
                    "justification": presence.motif_justification if presence else "",
                    "pointe_le": (
                        timezone.localtime(presence.timestamp).strftime(
                            "%d/%m/%Y %H:%M"
                        )
                        if presence
                        else ""
                    ),
                }
            )
    return lignes


def exporter_csv(utilisateur, params):
    lignes = lignes_export(utilisateur, params)
    colonnes = [
        ("date", "Date"),
        ("heure_debut", "Heure de d\u00e9but"),
        ("heure_fin", "Heure de fin"),
        ("cours", "Cours"),
        ("niveau", "Niveau"),
        ("salle", "Salle"),
        ("type", "Type de s\u00e9ance"),
        ("etudiant", "\u00c9tudiant"),
        ("email", "Email"),
        ("matricule", "Matricule"),
        ("statut", "Statut"),
        ("justification", "Justification"),
        ("pointe_le", "Point\u00e9 le"),
    ]
    tampon = io.StringIO()
    # BOM UTF-8 : Excel reconna\u00eet les accents sans manipulation.
    tampon.write("\ufeff")
    writer = csv.writer(tampon, delimiter=";", quoting=csv.QUOTE_MINIMAL)
    writer.writerow([libelle for _, libelle in colonnes])
    for ligne in lignes:
        writer.writerow([ligne.get(cle, "") for cle, _ in colonnes])
    return tampon.getvalue(), len(lignes)
