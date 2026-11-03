/**
 * Carte — conteneur unique pour les blocs de contenu (stats, listes, formulaires).
 * Fond blanc sur page gris clair : texte sombre sur fond clair (lisibilité écran).
 */
export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-app border border-slate-200 bg-white shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 ${className}`}
    >
      <div className="min-w-0 space-y-0.5">
        {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
        {description && (
          <p className="max-w-prose65 text-sm text-slate-600">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 ${className}`}
    >
      {children}
    </div>
  );
}
