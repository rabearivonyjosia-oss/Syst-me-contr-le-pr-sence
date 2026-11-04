/** Formatage français des dates, heures et nombres. */

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** `AAAA-MM-JJ` → `JJ/MM/AAAA` (sans décalage de fuseau). */
export function formatDate(valeur) {
  if (!valeur) return '—';
  const texte = String(valeur).slice(0, 10);
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texte);
  if (!correspondance) return String(valeur);
  const [, annee, mois, jour] = correspondance;
  return `${jour}/${mois}/${annee}`;
}

/** Date longue : « 4 novembre 2026 ». */
export function formatDateLongue(valeur) {
  if (!valeur) return '—';
  const texte = String(valeur).slice(0, 10);
  const correspondance = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texte);
  if (!correspondance) return String(valeur);
  const [, annee, mois, jour] = correspondance;
  return `${Number(jour)} ${MOIS[Number(mois) - 1]} ${annee}`;
}

/** `HH:MM:SS` → `HH:MM`. */
export function formatHeure(valeur) {
  if (!valeur) return '—';
  return String(valeur).slice(0, 5);
}

/** Horodatage ISO → `JJ/MM/AAAA HH:MM`. */
export function formatDateHeure(valeur) {
  if (!valeur) return '—';
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) return String(valeur);
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const heures = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${jour}/${mois}/${date.getFullYear()} ${heures}:${minutes}`;
}

/** Plage horaire lisible : « 09:00 – 11:00 ». */
export function formatPlage(debut, fin) {
  return `${formatHeure(debut)} – ${formatHeure(fin)}`;
}

export function formatNombre(valeur) {
  const nombre = Number(valeur);
  if (!Number.isFinite(nombre)) return '—';
  return new Intl.NumberFormat('fr-FR').format(nombre);
}

export function formatPourcentage(valeur) {
  const nombre = Number(valeur);
  if (!Number.isFinite(nombre)) return '—';
  return `${nombre.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}

export function initiales(nom) {
  const texte = String(nom || '').trim();
  if (!texte) return '?';
  const morceaux = texte.split(/\s+/).filter(Boolean);
  if (morceaux.length === 1) return morceaux[0].slice(0, 2).toUpperCase();
  return `${morceaux[0][0]}${morceaux[morceaux.length - 1][0]}`.toUpperCase();
}

export function aujourdHuiIso() {
  const maintenant = new Date();
  const decalage = maintenant.getTimezoneOffset() * 60000;
  return new Date(maintenant.getTime() - decalage).toISOString().slice(0, 10);
}
