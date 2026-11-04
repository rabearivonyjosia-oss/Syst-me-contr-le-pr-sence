import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Alert, Button, Card } from '../ui/index.js';

/*
 * Route protégée (Phase 2).
 * - Sans token : redirection vers /connexion (une seule entrée d'authentification).
 * - Avec roles : vérifie le rôle effectif ; sinon écran « Accès refusé » explicite
 *   (icône + texte, jamais la couleur seule) avec retour à l'accueil du rôle.
 */
export function ProtectedRoute({ roles, children }) {
  const { estConnecte, role } = useAuth();
  const navigate = useNavigate();

  if (!estConnecte) {
    return <Navigate to="/connexion" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    const accueil = role === 'ETUDIANT' ? '/scan' : '/accueil';
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4 py-10 sm:px-6">
        <Card className="w-full p-6 text-center sm:p-8" aria-labelledby="acces-refuse-titre">
          <span
            aria-hidden="true"
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-app bg-danger-50 text-danger-700"
          >
            <ShieldAlert className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <h1 id="acces-refuse-titre" className="text-2xl font-bold tracking-tight text-slate-900">
            Accès refusé
          </h1>
          <p className="mx-auto mt-2 max-w-prose65 text-base text-slate-600">
            Cette page est réservée à {roles.includes('ETUDIANT') ? 'aux étudiants' : 'aux enseignants'}.
            Votre rôle actuel ne permet pas d’y accéder.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                navigate(accueil, { replace: true });
              }}
            >
              Retour à mon accueil
            </Button>
          </div>
          <Alert variant="info" title="Information" className="mt-6 text-left">
            Si ce n’est pas le bon rôle, déconnectez-vous puis reconnectez-vous.
          </Alert>
        </Card>
      </div>
    );
  }

  return children;
}

// Redirection après connexion selon le rôle : étudiant → scan, enseignant → accueil.
export function RedirectionApresConnexion() {
  const { role } = useAuth();
  return <Navigate to={role === 'ETUDIANT' ? '/scan' : '/accueil'} replace />;
}

export default ProtectedRoute;
