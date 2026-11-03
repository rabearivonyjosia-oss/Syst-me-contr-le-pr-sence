import { Loader2 } from 'lucide-react';

/**
 * Indicateur de chargement — annoncé aux lecteurs d'écran (role="status").
 */
function Spinner({ label = 'Chargement…', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-3 py-10 text-slate-600 ${className}`}>
      <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-brand-700" />
      <span className="text-base font-medium">{label}</span>
    </div>
  );
}

export default Spinner;
