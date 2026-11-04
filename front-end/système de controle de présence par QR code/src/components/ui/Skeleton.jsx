/** Squelettes de chargement - annoncés une seule fois aux lecteurs d'écran. */
export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-app bg-slate-200/80 ${className}`}
    />
  );
}

export function SkeletonTexte({ lignes = 3, className = '' }) {
  return (
    <div aria-hidden="true" className={`space-y-2 ${className}`}>
      {Array.from({ length: lignes }).map((_, index) => (
        <div
          key={index}
          className={`h-4 animate-pulse rounded bg-slate-200/80 ${
            index === lignes - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonCarte({ className = '' }) {
  return (
    <div
      role="status"
      aria-label="Chargement du contenu"
      className={`space-y-3 rounded-app border border-slate-200 bg-white p-5 shadow-card ${className}`}
    >
      <Skeleton className="h-5 w-1/3" />
      <SkeletonTexte lignes={3} />
    </div>
  );
}

export function SkeletonTable({ lignes = 5, colonnes = 4 }) {
  return (
    <div role="status" aria-label="Chargement du tableau" className="space-y-2">
      {Array.from({ length: lignes }).map((_, ligne) => (
        <div key={ligne} className="flex gap-3">
          {Array.from({ length: colonnes }).map((__, colonne) => (
            <Skeleton key={colonne} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
