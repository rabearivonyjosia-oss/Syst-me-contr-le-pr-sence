import { CheckCircle2, Clock, Info, MinusCircle, XCircle } from 'lucide-react';

/**
 * Badge de statut — TOUJOURS couleur + icône + texte (jamais la couleur seule).
 * Répond à l'exigence daltonisme : la forme et le libellé doublent l'information.
 */
const VARIANTS = {
  success: {
    classes: 'border-success-200 bg-success-50 text-success-800',
    Icon: CheckCircle2,
  },
  danger: {
    classes: 'border-danger-200 bg-danger-50 text-danger-800',
    Icon: XCircle,
  },
  warning: {
    classes: 'border-warning-200 bg-warning-50 text-warning-800',
    Icon: Clock,
  },
  info: {
    classes: 'border-brand-200 bg-brand-50 text-brand-800',
    Icon: Info,
  },
  neutral: {
    classes: 'border-slate-200 bg-slate-100 text-slate-700',
    Icon: MinusCircle,
  },
};

function Badge({ variant = 'neutral', className = '', children }) {
  const { classes, Icon } = VARIANTS[variant] ?? VARIANTS.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-sm font-semibold ${classes} ${className}`}
    >
      <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
      <span>{children}</span>
    </span>
  );
}

export default Badge;
