/**
 * État vide explicite — jamais une page blanche.
 * Icône descriptive + titre + explication + action proposée.
 */
function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-app border border-dashed border-slate-300 bg-white px-6 py-12 text-center ${className}`}
    >
      {Icon && (
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"
        >
          <Icon className="h-7 w-7" strokeWidth={1.75} />
        </span>
      )}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="mx-auto max-w-prose65 text-base text-slate-600">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export default EmptyState;
