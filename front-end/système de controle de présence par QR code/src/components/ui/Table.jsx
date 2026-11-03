/**
 * Tableau — en-têtes clairs, lignes alternées, séparation nette.
 * Défilement horizontal sur petit écran plutôt que de tasser les colonnes.
 * Les statuts s'affichent avec <Badge variant="success|danger|warning"> (couleur + icône + texte).
 */
export function Table({ caption, className = '', children }) {
  return (
    <div
      className={`overflow-x-auto rounded-app border border-slate-200 bg-white shadow-card ${className}`}
    >
      <table className="w-full min-w-[40rem] border-collapse text-left text-base text-slate-800">
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
      {children}
    </thead>
  );
}

export function Th({ className = '', children, ...props }) {
  return (
    <th scope="col" className={`px-4 py-3 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
}

export function Tbody({ children }) {
  return <tbody className="divide-y divide-slate-200">{children}</tbody>;
}

export function Tr({ className = '', children }) {
  // Lignes alternées : repère visuel sans dépendre de la couleur seule
  return (
    <tr className={`odd:bg-white even:bg-slate-50/70 hover:bg-brand-50/60 ${className}`}>
      {children}
    </tr>
  );
}

export function Td({ className = '', children, ...props }) {
  return (
    <td className={`px-4 py-3 align-middle tabular-nums ${className}`} {...props}>
      {children}
    </td>
  );
}
