import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';

/**
 * Alerte — retour d'état explicite. Couleur + icône + texte (jamais la couleur seule).
 * role="alert" pour les erreurs/avertissements (annoncé immédiatement),
 * role="status" pour les informations/succès.
 */
const VARIANTS = {
  info: {
    classes: 'border-brand-200 bg-brand-50 text-brand-900',
    Icon: Info,
    role: 'status',
  },
  success: {
    classes: 'border-success-200 bg-success-50 text-success-800',
    Icon: CheckCircle2,
    role: 'status',
  },
  warning: {
    classes: 'border-warning-200 bg-warning-50 text-warning-800',
    Icon: TriangleAlert,
    role: 'alert',
  },
  danger: {
    classes: 'border-danger-200 bg-danger-50 text-danger-800',
    Icon: XCircle,
    role: 'alert',
  },
};

function Alert({ variant = 'info', title, className = '', children }) {
  const { classes, Icon, role } = VARIANTS[variant] ?? VARIANTS.info;

  return (
    <div
      role={role}
      className={`flex items-start gap-3 rounded-app border px-4 py-3 text-base ${classes} ${className}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2.25} />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className="leading-snug">{children}</div>}
      </div>
    </div>
  );
}

export default Alert;
