import { Loader2 } from 'lucide-react';

/**
 * Bouton unique de l'application.
 * - Une seule action principale par écran (variant="primary").
 * - Les actions destructives utilisent variant="danger" avec icône + texte.
 * - Taille md/lg ≥ 44 px de haut → cible tactile conforme (écrans téléphone).
 */
const VARIANTS = {
  primary:
    'border border-transparent bg-brand-700 text-white shadow-card hover:bg-brand-800 active:bg-brand-900 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none',
  secondary:
    'border border-slate-300 bg-white text-slate-800 shadow-card hover:bg-slate-50 active:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-400',
  danger:
    'border border-transparent bg-danger-700 text-white shadow-card hover:bg-danger-800 active:bg-danger-800 disabled:bg-slate-200 disabled:text-slate-500',
  ghost:
    'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-400',
};

const SIZES = {
  sm: 'h-9 gap-1.5 px-3 text-sm', // 36 px — actions secondaires denses (bureau)
  md: 'h-11 gap-2 px-4 text-base', // 44 px — taille par défaut (tactile OK)
  lg: 'h-12 gap-2 px-6 text-base', // 48 px — action principale mobile
};

function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex select-none items-center justify-center rounded-app font-semibold transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}

export default Button;
