/** Validations côté client (le serveur reste la source de vérité). */

import { NIVEAUX } from './constants.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValide(valeur) {
  return EMAIL.test(String(valeur || '').trim());
}

export function motDePasseValide(valeur) {
  return String(valeur || '').length >= 8;
}

/** Retourne un objet `{ champ: message }` ; vide si le formulaire est valide. */
export function validerCours(valeurs) {
  const erreurs = {};
  const nom = String(valeurs.nom_cours || '').trim();
  if (nom.length < 2) {
    erreurs.nom_cours = 'Indiquez un nom de cours d’au moins 2 caractères.';
  }
  if (!NIVEAUX.some((niveau) => niveau.value === valeurs.niveau)) {
    erreurs.niveau = 'Choisissez un niveau.';
  }
  return erreurs;
}

export function validerSeance(valeurs) {
  const erreurs = {};
  if (!valeurs.cours) {
    erreurs.cours = 'Choisissez un cours.';
  }
  if (!valeurs.date_seance) {
    erreurs.date_seance = 'Choisissez une date.';
  }
  if (!valeurs.heure_debut) {
    erreurs.heure_debut = 'Indiquez l’heure de début.';
  }
  if (!valeurs.heure_fin) {
    erreurs.heure_fin = 'Indiquez l’heure de fin.';
  }
  if (valeurs.heure_debut && valeurs.heure_fin && valeurs.heure_fin <= valeurs.heure_debut) {
    erreurs.heure_fin = 'L’heure de fin doit être postérieure à l’heure de début.';
  }
  const salle = String(valeurs.salle || '').trim();
  if (!salle) {
    erreurs.salle = 'Indiquez la salle.';
  }
  return erreurs;
}

export function validerProfil(valeurs, role) {
  const erreurs = {};
  if (!String(valeurs.username || '').trim()) {
    erreurs.username = 'Le nom d’utilisateur est obligatoire.';
  }
  if (!emailValide(valeurs.email)) {
    erreurs.email = 'Saisissez une adresse email valide.';
  }
  if (role === 'ETUDIANT') {
    if (!valeurs.niveau) erreurs.niveau = 'Choisissez votre niveau.';
    if (!String(valeurs.num_matricule || '').trim()) {
      erreurs.num_matricule = 'Le numéro de matricule est obligatoire.';
    }
  }
  return erreurs;
}

export function validerMotDePasse(valeurs) {
  const erreurs = {};
  if (!valeurs.current_password) {
    erreurs.current_password = 'Saisissez votre mot de passe actuel.';
  }
  if (!motDePasseValide(valeurs.new_password)) {
    erreurs.new_password = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
  }
  if (valeurs.new_password !== valeurs.confirm_password) {
    erreurs.confirm_password = 'La confirmation ne correspond pas au nouveau mot de passe.';
  }
  if (
    valeurs.new_password &&
    valeurs.new_password === valeurs.current_password
  ) {
    erreurs.new_password = 'Le nouveau mot de passe doit être différent de l’actuel.';
  }
  return erreurs;
}

export function validerInscription(valeurs) {
  const erreurs = validerProfil(valeurs, 'ETUDIANT');
  if (!motDePasseValide(valeurs.password)) {
    erreurs.password = 'Le mot de passe doit contenir au moins 8 caractères.';
  }
  if (valeurs.password !== valeurs.password_confirm) {
    erreurs.password_confirm = 'La confirmation ne correspond pas au mot de passe.';
  }
  return erreurs;
}
