import { useEffect, useId, useRef } from 'react';
import { TriangleAlert, X } from 'lucide-react';

/**
 * Modale accessible :
 * - role="dialog" + aria-modal + aria-labelledby / aria-describedby ;
 * - fermeture par Échap et par clic sur le fond ;
 * - focus déplacé dans la boîte, piégé à l'intérieur, restauré à la fermeture ;
 * - `variant="danger"` pour une confirmation destructive (icône + texte).
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
  const titreId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const elementPrecedent = document.activeElement;
    const panneau = panelRef.current;
    panneau?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !panneau) return;

      const focusables = panneau.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) {
        event.preventDefault();
        panneau.focus();
        return;
      }
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === premier) {
        event.preventDefault();
        dernier.focus();
      } else if (!event.shiftKey && document.activeElement === dernier) {
        event.preventDefault();
        premier.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const overflowPrecedent = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflowPrecedent;
      if (elementPrecedent instanceof HTMLElement) elementPrecedent.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-app bg-white shadow-2xl outline-none ${className}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {variant === 'danger' && (
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-app bg-danger-50 text-danger-700"
              >
                <TriangleAlert className="h-5 w-5" strokeWidth={2.25} />
              </span>
            )}
            <div className="min-w-0 space-y-0.5">
              <h2 id={titreId} className="text-xl font-bold text-slate-900">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="max-w-prose65 text-sm text-slate-600">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
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
