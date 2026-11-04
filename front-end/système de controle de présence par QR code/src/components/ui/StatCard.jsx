/** Carte d'indicateur clé (KPI) : libellé, valeur, icône et contexte. */
const STYLES = {
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

function StatCard({ titre, valeur, icone: Icone, description, variant = 'brand' }) {
  return (
    <div className="rounded-app border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{titre}</p>
        {Icone && (
          <span
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-app ${
              STYLES[variant] ?? STYLES.brand
            }`}
          >
            <Icone className="h-5 w-5" strokeWidth={2} />
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
        {valeur}
      </p>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
    </div>
  );
}

export default StatCard;
