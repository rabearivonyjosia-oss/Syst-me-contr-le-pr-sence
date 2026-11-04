/** Constantes métier partagées par les écrans. */

export const ROLES = {
  ADMIN: 'ADMIN',
  ENSEIGNANT: 'ENSEIGNANT',
  ETUDIANT: 'ETUDIANT',
};

export const LIBELLES_ROLE = {
  ADMIN: 'Administrateur',
  ENSEIGNANT: 'Enseignant',
  ETUDIANT: 'Étudiant',
};

export const NIVEAUX = [
  { value: 'L1', label: 'Licence 1' },
  { value: 'L2', label: 'Licence 2' },
  { value: 'L3', label: 'Licence 3' },
  { value: 'M1', label: 'Master 1' },
  { value: 'M2', label: 'Master 2' },
];

export const TYPES_SEANCE = [
  { value: 'CM', label: 'Cours magistral' },
  { value: 'TD', label: 'Travaux dirigés' },
  { value: 'TP', label: 'Travaux pratiques' },
  { value: 'EXAMEN', label: 'Examen' },
];

export const STATUTS_SEANCE = {
  A_VENIR: { label: 'À venir', variant: 'info' },
  EN_COURS: { label: 'En cours', variant: 'success' },
  TERMINEE: { label: 'Terminée', variant: 'neutral' },
};

export const STATUTS_PRESENCE = {
  PRESENT: { label: 'Présent', variant: 'success' },
  ABSENT: { label: 'Absent', variant: 'danger' },
  JUSTIFIE: { label: 'Justifié', variant: 'warning' },
};

export const TAILLE_PAGE = 10;
