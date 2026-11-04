import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Hash,
  Lock,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react';
import AuthLayout from './components/layout/AuthLayout.jsx';
import { Alert, Button, Input, Select } from './components/ui/index.js';
import { useAuth } from './context/AuthContext.jsx';
import { usePageTitle } from './hooks/usePageTitle.js';
import { NIVEAUX } from './utils/constants.js';
import { validerInscription } from './utils/validation.js';
import {
  authApi,
  champsDepuisErreur,
  messageDepuisErreur,
} from './services/api.js';

const VALEURS_INITIALES = {
  first_name: '',
  last_name: '',
  email: '',
  niveau: '',
  num_matricule: '',
  telephone: '',
  password: '',
  password_confirm: '',
};

function Register() {
  const { estConnecte } = useAuth();
  const navigate = useNavigate();

  const [valeurs, setValeurs] = useState(VALEURS_INITIALES);
  const [erreurs, setErreurs] = useState({});
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);

  usePageTitle('Créer un compte');

  if (estConnecte) {
    return <Navigate to="/accueil" replace />;
  }

  const modifier = (champ) => (event) => {
    setValeurs((actuelles) => ({ ...actuelles, [champ]: event.target.value }));
  };

  const soumettre = async (event) => {
    event.preventDefault();
    setErreur('');
    const email = valeurs.email.trim().toLowerCase();
    const validation = validerInscription({
      ...valeurs,
      username: email,
      email,
    });
    setErreurs(validation);
    if (Object.keys(validation).length > 0) return;

    setEnvoi(true);
    try {
      await authApi.register({
        username: email,
        email,
        first_name: valeurs.first_name.trim(),
        last_name: valeurs.last_name.trim(),
        niveau: valeurs.niveau,
        num_matricule: valeurs.num_matricule.trim(),
        telephone: valeurs.telephone.trim(),
        password: valeurs.password,
        password_confirm: valeurs.password_confirm,
      });
      navigate('/connexion', {
        replace: true,
        state: {
          email,
          message:
            'Votre compte étudiant est créé. Connectez-vous avec votre email et votre mot de passe.',
        },
      });
    } catch (probleme) {
      setErreurs(champsDepuisErreur(probleme));
      setErreur(
        messageDepuisErreur(
          probleme,
          'Inscription impossible. Vérifiez les informations puis réessayez.',
        ),
      );
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <AuthLayout panelTitle="Rejoignez vos cours en quelques secondes">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Créer un compte étudiant
          </h1>
          <p className="max-w-prose65 text-base text-slate-600">
            L’inscription autonome est réservée aux étudiants. Les comptes enseignants
            sont créés par l’administration.
          </p>
        </div>

        {erreur && (
          <Alert variant="danger" title="Inscription refusée">
            {erreur}
          </Alert>
        )}

        <form onSubmit={soumettre} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="inscription-prenom"
              label="Prénom"
              autoComplete="given-name"
              required
              value={valeurs.first_name}
              onChange={modifier('first_name')}
              leadingIcon={UserRound}
              error={erreurs.first_name}
              disabled={envoi}
            />
            <Input
              id="inscription-nom"
              label="Nom"
              autoComplete="family-name"
              required
              value={valeurs.last_name}
              onChange={modifier('last_name')}
              error={erreurs.last_name}
              disabled={envoi}
            />
          </div>

          <Input
            id="inscription-email"
            label="Adresse email"
            type="email"
            autoComplete="email"
            required
            hint="Elle servira d’identifiant de connexion."
            value={valeurs.email}
            onChange={modifier('email')}
            leadingIcon={Mail}
            error={erreurs.email}
            disabled={envoi}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              id="inscription-niveau"
              label="Niveau"
              required
              value={valeurs.niveau}
              onChange={modifier('niveau')}
              error={erreurs.niveau}
              disabled={envoi}
            >
              <option value="">Choisir un niveau</option>
              {NIVEAUX.map((niveau) => (
                <option key={niveau.value} value={niveau.value}>
                  {niveau.label}
                </option>
              ))}
            </Select>
            <Input
              id="inscription-matricule"
              label="Numéro de matricule"
              required
              value={valeurs.num_matricule}
              onChange={modifier('num_matricule')}
              leadingIcon={Hash}
              error={erreurs.num_matricule}
              disabled={envoi}
            />
          </div>

          <Input
            id="inscription-telephone"
            label="Téléphone (optionnel)"
            type="tel"
            autoComplete="tel"
            value={valeurs.telephone}
            onChange={modifier('telephone')}
            leadingIcon={Phone}
            error={erreurs.telephone}
            disabled={envoi}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="inscription-mot-de-passe"
              label="Mot de passe"
              type={afficherMotDePasse ? 'text' : 'password'}
              autoComplete="new-password"
              required
              hint="Au moins 8 caractères, pas uniquement des chiffres."
              value={valeurs.password}
              onChange={modifier('password')}
              leadingIcon={Lock}
              error={erreurs.password}
              disabled={envoi}
              trailing={
                <button
                  type="button"
                  onClick={() => setAfficherMotDePasse((valeur) => !valeur)}
                  aria-label={
                    afficherMotDePasse
                      ? 'Masquer les mots de passe'
                      : 'Afficher les mots de passe'
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
            <Input
              id="inscription-confirmation"
              label="Confirmer le mot de passe"
              type={afficherMotDePasse ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={valeurs.password_confirm}
              onChange={modifier('password_confirm')}
              leadingIcon={Lock}
              error={erreurs.password_confirm}
              disabled={envoi}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={envoi}>
            Créer mon compte
          </Button>
        </form>

        <p className="border-t border-slate-200 pt-4 text-center text-base text-slate-600">
          <Link
            to="/connexion"
            className="inline-flex items-center gap-1.5 font-semibold text-brand-700"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            J’ai déjà un compte
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
