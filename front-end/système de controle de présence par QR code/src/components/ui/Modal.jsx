import { useEffect, useRef } from 'react';
import { TriangleAlert, X } from 'lucide-react';

/**
 * Modale accessible :
 * - role="dialog" + aria-modal + aria-labelledby ;
 * - fermeture par Échap et par clic sur le fond ;
 * - le focus est déplacé dans la boîte à l'ouverture ;
 * - `variant="danger"` pour une confirmation destructive (icône + texte).
 *
 * Toute suppression DOIT passer par cette modale (confirmation avant destruction).
 */
function Modal({
  open,
  onClose,
  title,
  description,
  variant = 'default',
  footer,
  className = '',
  children,
}) {
  const panelRef = useRef(null);
  const titleId = 'modal-titre';

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full max-w-md rounded-app bg-white shadow-2xl outline-none ${className}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex items-start gap-3">
            {variant === 'danger' && (
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-app bg-danger-50 text-danger-700"
              >
                <TriangleAlert className="h-5 w-5" strokeWidth={2.25} />
              </span>
            )}
            <div className="space-y-0.5">
              <h2 id={titleId} className="text-xl font-bold text-slate-900">
                {title}
              </h2>
              {description && (
                <p className="max-w-prose65 text-sm text-slate-600">{description}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
            title="Fermer"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-app text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {children && <div className="px-5 py-4 text-base text-slate-800">{children}</div>}

        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
