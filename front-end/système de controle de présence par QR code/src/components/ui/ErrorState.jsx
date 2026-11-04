import { RefreshCw, ServerCrash, WifiOff } from 'lucide-react';
import { estErreurReseau, messageDepuisErreur } from '../../services/api.js';
import Button from './Button.jsx';

/** État d'erreur explicite : cause lisible + action « Réessayer ». */
function ErrorState({
  titre = 'Le chargement a échoué',
  erreur,
  message,
  onRetry,
  className = '',
}) {
  const reseau = estErreurReseau(erreur);
  const Icone = reseau ? WifiOff : ServerCrash;
  const texte =
    message ||
    messageDepuisErreur(
      erreur,
      'Une erreur est survenue pendant le chargement des données.',
    );

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-app border border-danger-200 bg-danger-50 px-6 py-10 text-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-danger-700"
      >
        <Icone className="h-7 w-7" strokeWidth={1.75} />
      </span>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-danger-900">{titre}</h3>
        <p className="mx-auto max-w-prose65 text-base text-danger-800">{texte}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          <RefreshCw aria-hidden="true" className="h-5 w-5" />
          Réessayer
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
