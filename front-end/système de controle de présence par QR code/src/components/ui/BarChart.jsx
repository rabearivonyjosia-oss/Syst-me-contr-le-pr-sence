import { BarChart3, Inbox } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import { formatNombre, formatPourcentage } from '../../utils/format.js';

/**
 * Graphique en barres accessible, sans bibliothèque externe.
 * - Le texte (libellé + valeur) porte l'information, la longueur de barre la
 *   double visuellement : aucune information ne dépend de la couleur.
 * - Un tableau alternatif est disponible via « Afficher le tableau ».
 */
function BarChart({
  titre,
  description,
  donnees = [],
  max = 100,
  unite = '%',
  formaterValeur,
  libelleValeur = 'Valeur',
  className = '',
}) {
  if (!donnees.length) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune donnée"
        description="Aucune valeur n'est disponible pour cette période."
        className={className}
      />
    );
  }

  const valeurAffichee = (valeur) => {
    if (formaterValeur) return formaterValeur(valeur);
    if (unite === '%') return formatPourcentage(valeur);
    return `${formatNombre(valeur)}${unite ? ` ${unite}` : ''}`;
  };

  return (
    <figure className={className}>
      {titre && (
        <figcaption className="mb-4 space-y-1">
          <span className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <BarChart3 aria-hidden="true" className="h-5 w-5 text-brand-700" />
            {titre}
          </span>
          {description && (
            <span className="block max-w-prose65 text-sm text-slate-600">{description}</span>
          )}
        </figcaption>
      )}

      <ul className="space-y-3">
        {donnees.map(({ label, valeur, detail }) => {
          const valeurNumerique = Number(valeur) || 0;
          const ratio = max > 0 ? Math.min(100, Math.max(0, (valeurNumerique / max) * 100)) : 0;
          return (
            <li key={label}>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-base font-medium text-slate-800">{label}</span>
                <span className="text-base font-bold tabular-nums text-slate-900">
                  {valeurAffichee(valeurNumerique)}
                </span>
              </div>
              <div
                aria-hidden="true"
                className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
              >
                <div
                  className="h-full rounded-full bg-brand-700 transition-[width] duration-500"
                  style={{ width: `${ratio}%` }}
                />
              </div>
              {detail && <p className="mt-1 text-sm text-slate-600">{detail}</p>}
            </li>
          );
        })}
      </ul>

      <details className="mt-4 rounded-app border border-slate-200 bg-slate-50 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-brand-800">
          Afficher les valeurs sous forme de tableau
        </summary>
        <table className="mt-3 w-full border-collapse text-left text-sm">
          <caption className="sr-only">{titre ?? 'Valeurs du graphique'}</caption>
          <thead>
            <tr className="border-b border-slate-300 text-slate-700">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Élément
              </th>
              <th scope="col" className="py-2 pl-3 text-right font-semibold">
                {libelleValeur}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {donnees.map(({ label, valeur }) => (
              <tr key={label}>
                <th scope="row" className="py-2 pr-3 font-medium text-slate-800">
                  {label}
                </th>
                <td className="py-2 pl-3 text-right tabular-nums text-slate-900">
                  {valeurAffichee(Number(valeur) || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

export default BarChart;
