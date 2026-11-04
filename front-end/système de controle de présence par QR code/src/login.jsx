import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import AuthLayout from './components/layout/AuthLayout.jsx';
import { Alert, Button, Input } from './components/ui/index.js';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './context/ToastContext.jsx';
import { usePageTitle } from './hooks/usePageTitle.js';
import { emailValide } from './utils/validation.js';
import { messageDepuisErreur } from './services/api.js';

function Login() {
  const { connexion, estConnecte, erreurSession } = useAuth();
  const { succes } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email ?? '');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  usePageTitle('Connexion');

  const destination = location.state?.from || '/accueil';
  const messageInscription = location.state?.message || '';

  if (estConnecte) {
    return <Navigate to={destination} replace />;
  }

  const soumettre = async (event) => {
    event.preventDefault();
    setErreur('');
    const prochaines = {};
    if (!emailValide(email)) {
      prochaines.email = 'Saisissez une adresse email valide.';
    }
    if (!motDePasse) {
      prochaines.motDePasse = 'Saisissez votre mot de passe.';
    }
    setErreurs(prochaines);
    if (Object.keys(prochaines).length > 0) return;

    setEnvoi(true);
    try {
      const profil = await connexion(email.trim().toLowerCase(), motDePasse);
      succes(`Bienvenue ${profil?.first_name || profil?.nom_complet || ''}.`.trim());
      navigate(destination, { replace: true });
    } catch (probleme) {
      setErreur(
        messageDepuisErreur(
          probleme,
          'Connexion impossible. Vérifiez votre email et votre mot de passe.',
        ),
      );
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Connexion</h1>
          <p className="max-w-prose65 text-base text-slate-600">
            Accédez à vos cours, séances et feuilles de présence.
          </p>
        </div>

        {messageInscription && (
          <Alert variant="success" title="Compte créé">
            {messageInscription}
          </Alert>
        )}

        {erreurSession && !messageInscription && (
          <Alert variant="warning" title="Session">
            {erreurSession}
          </Alert>
        )}

        {erreur && (
          <Alert variant="danger" title="Connexion refusée">
            {erreur}
          </Alert>
        )}

        <form onSubmit={soumettre} className="space-y-4" noValidate>
          <Input
            id="connexion-email"
            label="Adresse email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leadingIcon={Mail}
            error={erreurs.email}
            disabled={envoi}
          />

          <Input
            id="connexion-mot-de-passe"
            label="Mot de passe"
            type={afficherMotDePasse ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(event) => setMotDePasse(event.target.value)}
            leadingIcon={Lock}
            error={erreurs.motDePasse}
            disabled={envoi}
            trailing={
              <button
                type="button"
                onClick={() => setAfficherMotDePasse((valeur) => !valeur)}
                aria-label={
                  afficherMotDePasse
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
                aria-pressed={afficherMotDePasse}
                className="flex h-10 w-10 items-center justify-center rounded-app text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                {afficherMotDePasse ? (
                  <EyeOff aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <Eye aria-hidden="true" className="h-5 w-5" />
                )}
              </button>
            }
          />

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={envoi}>
            Se connecter
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </Button>
        </form>

        <p className="border-t border-slate-200 pt-4 text-center text-base text-slate-600">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="font-semibold text-brand-700">
            Créer un compte étudiant
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
