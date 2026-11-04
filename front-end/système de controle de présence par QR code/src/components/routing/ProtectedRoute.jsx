import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ErrorState, Spinner } from '../ui/index.js';

/**
 * Garde de route.
 * - Session en cours de vérification : indicateur explicite (pas de saut visuel).
 * - Session non vérifiable (réseau) : message + réessayer, sans perdre les jetons.
 * - Non connecté : redirection vers /connexion en mémorisant la page demandée.
 * - Rôle non autorisé : redirection vers la page 403 dédiée.
 */
export function ProtectedRoute({ roles, children }) {
  const { statut, role, erreurSession, rechargerProfil } = useAuth();
  const location = useLocation();

  if (statut === 'chargement') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <Spinner label="Vérification de votre session…" />
      </div>
    );
  }

  if (statut === 'erreur') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <ErrorState
          titre="Session indisponible"
          message={erreurSession}
          onRetry={rechargerProfil}
          className="w-full max-w-xl"
        />
      </div>
    );
  }

  if (statut !== 'connecte') {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/acces-refuse" replace />;
  }

  return children ?? <Outlet />;
}

/** Redirection d'entrée : l'accueil s'adapte au rôle de l'utilisateur. */
export function RedirectionApresConnexion() {
  const { statut } = useAuth();

  if (statut === 'chargement') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <Spinner label="Vérification de votre session…" />
      </div>
    );
  }

  return <Navigate to="/accueil" replace />;
}

export default ProtectedRoute;
