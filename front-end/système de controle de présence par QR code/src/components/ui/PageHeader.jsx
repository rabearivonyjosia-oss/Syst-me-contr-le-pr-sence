import { Link } from 'react-router-dom';

/** En-tête de page : fil d'Ariane, titre unique h1, description, action principale. */
function PageHeader({ titre, description, fil, action, icone: Icone, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {fil && fil.length > 0 && (
        <nav aria-label="Fil d’Ariane">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
            {fil.map((element, index) => {
              const dernier = index === fil.length - 1;
              return (
                <li key={`${element.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span aria-hidden="true" className="text-slate-400">
                      /
                    </span>
                  )}
                  {element.to && !dernier ? (
                    <Link
                      to={element.to}
                      className="rounded font-medium text-brand-700 underline-offset-2 hover:underline"
                    >
                      {element.label}
                    </Link>
                  ) : (
                    <span aria-current={dernier ? 'page' : undefined} className="font-medium">
                      {element.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icone && (
            <span
              aria-hidden="true"
              className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-app bg-brand-100 text-brand-800 sm:flex"
            >
              <Icone className="h-6 w-6" strokeWidth={1.75} />
            </span>
          )}
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {titre}
            </h1>
            {description && (
              <p className="max-w-prose65 text-base text-slate-600">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
