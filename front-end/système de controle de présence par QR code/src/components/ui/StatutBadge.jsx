import Badge from './Badge.jsx';
import { STATUTS_PRESENCE, STATUTS_SEANCE } from '../../utils/constants.js';

/** Badge de statut de séance : couleur + icône + libellé. */
export function StatutSeanceBadge({ statut }) {
  const configuration = STATUTS_SEANCE[statut] ?? {
    label: statut || 'Inconnu',
    variant: 'neutral',
  };
  return <Badge variant={configuration.variant}>{configuration.label}</Badge>;
}

/** Badge de statut de présence : couleur + icône + libellé. */
export function StatutPresenceBadge({ statut }) {
  const configuration = STATUTS_PRESENCE[statut] ?? {
    label: statut || 'Inconnu',
    variant: 'neutral',
  };
  return <Badge variant={configuration.variant}>{configuration.label}</Badge>;
}

export default StatutSeanceBadge;
