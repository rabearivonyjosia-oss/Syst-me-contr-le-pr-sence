import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

/**
 * Notifications non bloquantes, annoncées via `aria-live="polite"`.
 * Les messages d'erreur critiques restent aussi affichés près du formulaire.
 */
const ToastContext = createContext(null);

const VARIANTS = {
  success: {
    classes: 'border-success-200 bg-success-50 text-success-900',
    Icon: CheckCircle2,
  },
  info: {
    classes: 'border-brand-200 bg-brand-50 text-brand-900',
    Icon: Info,
  },
  warning: {
    classes: 'border-warning-200 bg-warning-50 text-warning-900',
    Icon: TriangleAlert,
  },
  danger: {
    classes: 'border-danger-200 bg-danger-50 text-danger-900',
    Icon: TriangleAlert,
  },
};

export function ToastProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const minuteries = useRef(new Map());

  useEffect(() => {
    const cartes = minuteries.current;
    return () => {
      cartes.forEach((minuterie) => window.clearTimeout(minuterie));
      cartes.clear();
    };
  }, []);

  const fermer = useCallback((id) => {
    const minuterie = minuteries.current.get(id);
    if (minuterie) {
      window.clearTimeout(minuterie);
      minuteries.current.delete(id);
    }
    setNotifications((liste) => liste.filter((item) => item.id !== id));
  }, []);

  const afficher = useCallback(
    (message, { variant = 'success', duree = 6000 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setNotifications((liste) => [...liste.slice(-3), { id, message, variant }]);
      if (duree > 0) {
        const minuterie = window.setTimeout(() => fermer(id), duree);
        minuteries.current.set(id, minuterie);
      }
      return id;
    },
    [fermer],
  );

  const valeur = useMemo(
    () => ({
      afficher,
      succes: (message, options) => afficher(message, { ...options, variant: 'success' }),
      info: (message, options) => afficher(message, { ...options, variant: 'info' }),
      avertissement: (message, options) =>
        afficher(message, { ...options, variant: 'warning' }),
      erreur: (message, options) => afficher(message, { ...options, variant: 'danger' }),
      fermer,
    }),
    [afficher, fermer],
  );

  return (
    <ToastContext.Provider value={valeur}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:top-20 sm:bottom-auto sm:items-end"
      >
        {notifications.map(({ id, message, variant }) => {
          const { classes, Icon } = VARIANTS[variant] ?? VARIANTS.info;
          return (
            <div
              key={id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-app border px-4 py-3 shadow-lg ${classes}`}
            >
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="min-w-0 flex-1 text-sm font-medium leading-snug">{message}</p>
              <button
                type="button"
                onClick={() => fermer(id)}
                aria-label="Fermer la notification"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-app hover:bg-black/5"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexte = useContext(ToastContext);
  if (!contexte) {
    throw new Error('useToast doit être utilisé à l’intérieur de <ToastProvider>');
  }
  return contexte;
}
