import { useState } from 'react';
import {
  CalendarDays,
  Eye,
  EyeOff,
  GraduationCap,
  Hash,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  PageHeader,
  Select,
} from '../components/ui/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  authApi,
  champsDepuisErreur,
  messageDepuisErreur,
} from '../services/api.js';
import { LIBELLES_ROLE, NIVEAUX } from '../utils/constants.js';
import { formatDate, initiales } from '../utils/format.js';
import { validerMotDePasse, validerProfil } from '../utils/validation.js';

function Profil() {
  const { utilisateur, role, estEtudiant, majUtilisateur } = useAuth();
  const { succes } = useToast();

  const [valeurs, setValeurs] = useState(() => ({
    username: utilisateur?.username ?? '',
    email: utilisateur?.email ?? '',
    first_name: utilisateur?.first_name ?? '',
    last_name: utilisateur?.last_name ?? '',
    telephone: utilisateur?.telephone ?? '',
    niveau: utilisateur?.niveau ?? '',
    num_matricule: utilisateur?.num_matricule ?? '',
  }));
  const [erreurs, setErreurs] = useState({});
  const [erreurProfil, setErreurProfil] = useState('');
  const [envoiProfil, setEnvoiProfil] = useState(false);

  const [motsDePasse, setMotsDePasse] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [erreursMotDePasse, setErreursMotDePasse] = useState({});
  const [erreurMotDePasse, setErreurMotDePasse] = useState('');
  const [envoiMotDePasse, setEnvoiMotDePasse] = useState(false);
  const [afficherMotsDePasse, setAfficherMotsDePasse] = useState(false);

  usePageTitle('Mon profil');

  if (!utilisateur) return null;

  const modifier = (champ) => (event) => {
    setValeurs((actuelles) => ({ ...actuelles, [champ]: event.target.value }));
  };

  const modifierMotDePasse = (champ) => (event) => {
    setMotsDePasse((actuels) => ({ ...actuels, [champ]: event.target.value }));
  };

  const enregistrerProfil = async (event) => {
    event.preventDefault();
    setErreurProfil('');
    const validation = validerProfil(valeurs, role);
    setErreurs(validation);
    if (Object.keys(validation).length > 0) return;

    const charge = {
      username: valeurs.username.trim(),
      email: valeurs.email.trim().toLowerCase(),
      first_name: valeurs.first_name.trim(),
      last_name: valeurs.last_name.trim(),
      telephone: valeurs.telephone.trim(),
    };
    if (estEtudiant) {
      charge.niveau = valeurs.niveau;
      charge.num_matricule = valeurs.num_matricule.trim();
    }

    setEnvoiProfil(true);
    try {
      const reponse = await authApi.updateMe(charge);
      majUtilisateur(reponse.user);
      setValeurs({
        username: reponse.user.username ?? '',
        email: reponse.user.email ?? '',
        first_name: reponse.user.first_name ?? '',
        last_name: reponse.user.last_name ?? '',
        telephone: reponse.user.telephone ?? '',
        niveau: reponse.user.niveau ?? '',
        num_matricule: reponse.user.num_matricule ?? '',
      });
      setErreurs({});
      succes('Votre profil a été mis à jour.');
    } catch (probleme) {
      setErreurs(champsDepuisErreur(probleme));
      setErreurProfil(
        messageDepuisErreur(
          probleme,
          'Impossible d’enregistrer votre profil. Vérifiez les informations saisies.',
        ),
      );
    } finally {
      setEnvoiProfil(false);
    }
  };

  const changerMotDePasse = async (event) => {
    event.preventDefault();
    setErreurMotDePasse('');
    const validation = validerMotDePasse(motsDePasse);
    setErreursMotDePasse(validation);
    if (Object.keys(validation).length > 0) return;

    setEnvoiMotDePasse(true);
    try {
      await authApi.changePassword(motsDePasse);
      setMotsDePasse({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setErreursMotDePasse({});
      succes('Votre mot de passe a été modifié.');
    } catch (probleme) {
      setErreursMotDePasse(champsDepuisErreur(probleme));
      setErreurMotDePasse(
        messageDepuisErreur(
          probleme,
          'Impossible de modifier le mot de passe. Vérifiez votre mot de passe actuel.',
        ),
      );
    } finally {
      setEnvoiMotDePasse(false);
    }
  };

  return (
    <Page>
      <PageHeader
        titre="Mon profil"
        description="Mettez à jour vos informations personnelles et votre mot de passe."
        icone={UserRound}
      />

      <Card>
        <CardBody className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-800"
            >
              {initiales(utilisateur.nom_complet || utilisateur.username)}
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900">
                {utilisateur.nom_complet || utilisateur.username}
              </p>
              <p className="text-sm text-slate-600">{utilisateur.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{LIBELLES_ROLE[role] ?? role}</Badge>
            {estEtudiant && utilisateur.niveau_libelle && (
              <Badge variant="neutral">{utilisateur.niveau_libelle}</Badge>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Informations personnelles"
            description="Votre adresse email sert d’identifiant de connexion."
          />
          <CardBody>
            <form onSubmit={enregistrerProfil} className="space-y-4" noValidate>
              {erreurProfil && (
                <p
                  role="alert"
                  className="rounded-app bg-danger-50 px-3 py-2 text-sm font-medium text-danger-800"
                >
                  {erreurProfil}
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="profil-prenom"
                  label="Prénom"
                  autoComplete="given-name"
                  value={valeurs.first_name}
                  onChange={modifier('first_name')}
                  error={erreurs.first_name}
                  disabled={envoiProfil}
                  leadingIcon={UserRound}
                />
                <Input
                  id="profil-nom"
                  label="Nom"
                  autoComplete="family-name"
                  value={valeurs.last_name}
                  onChange={modifier('last_name')}
                  error={erreurs.last_name}
                  disabled={envoiProfil}
                />
              </div>

              <Input
                id="profil-email"
                label="Adresse email"
                type="email"
                autoComplete="email"
                required
                value={valeurs.email}
                onChange={modifier('email')}
                error={erreurs.email}
                disabled={envoiProfil}
                leadingIcon={Mail}
              />

              <Input
                id="profil-identifiant"
                label="Identifiant de connexion"
                required
                value={valeurs.username}
                onChange={modifier('username')}
                error={erreurs.username}
                hint="Utilisez une adresse email ou un identifiant court, sans espace."
                disabled={envoiProfil}
                autoComplete="username"
              />

              <Input
                id="profil-telephone"
                label="Téléphone (optionnel)"
                type="tel"
                autoComplete="tel"
                value={valeurs.telephone}
                onChange={modifier('telephone')}
                error={erreurs.telephone}
                disabled={envoiProfil}
                leadingIcon={Phone}
              />

              {estEtudiant && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Select
                    id="profil-niveau"
                    label="Niveau"
                    required
                    value={valeurs.niveau}
                    onChange={modifier('niveau')}
                    error={erreurs.niveau}
                    disabled={envoiProfil}
                  >
                    <option value="">Choisir un niveau</option>
                    {NIVEAUX.map((niveau) => (
                      <option key={niveau.value} value={niveau.value}>
                        {niveau.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    id="profil-matricule"
                    label="Numéro de matricule"
                    required
                    value={valeurs.num_matricule}
                    onChange={modifier('num_matricule')}
                    error={erreurs.num_matricule}
                    disabled={envoiProfil}
                    leadingIcon={Hash}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays aria-hidden="true" className="h-4 w-4" />
                  Compte créé le {formatDate(utilisateur.date_joined)}
                </p>
                <Button type="submit" variant="primary" loading={envoiProfil}>
                  <Save aria-hidden="true" className="h-5 w-5" />
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Mot de passe"
              description="Choisissez un mot de passe d’au moins 8 caractères, différent de l’ancien."
            />
            <CardBody>
              <form onSubmit={changerMotDePasse} className="space-y-4" noValidate>
                {erreurMotDePasse && (
                  <p
                    role="alert"
                    className="rounded-app bg-danger-50 px-3 py-2 text-sm font-medium text-danger-800"
                  >
                    {erreurMotDePasse}
                  </p>
                )}

                <Input
                  id="profil-mot-de-passe-actuel"
                  label="Mot de passe actuel"
                  type={afficherMotsDePasse ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={motsDePasse.current_password}
                  onChange={modifierMotDePasse('current_password')}
                  error={erreursMotDePasse.current_password}
                  disabled={envoiMotDePasse}
                  leadingIcon={Lock}
                />

                <Input
                  id="profil-nouveau-mot-de-passe"
                  label="Nouveau mot de passe"
                  type={afficherMotsDePasse ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={motsDePasse.new_password}
                  onChange={modifierMotDePasse('new_password')}
                  error={erreursMotDePasse.new_password}
                  disabled={envoiMotDePasse}
                  leadingIcon={KeyRound}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setAfficherMotsDePasse((valeur) => !valeur)}
                      aria-label={
                        afficherMotsDePasse
                          ? 'Masquer les mots de passe'
                          : 'Afficher les mots de passe'
                      }
                      aria-pressed={afficherMotsDePasse}
                      className="flex h-10 w-10 items-center justify-center rounded-app text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    >
                      {afficherMotsDePasse ? (
                        <EyeOff aria-hidden="true" className="h-5 w-5" />
                      ) : (
                        <Eye aria-hidden="true" className="h-5 w-5" />
                      )}
                    </button>
                  }
                />

                <Input
                  id="profil-confirmation-mot-de-passe"
                  label="Confirmer le nouveau mot de passe"
                  type={afficherMotsDePasse ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={motsDePasse.confirm_password}
                  onChange={modifierMotDePasse('confirm_password')}
                  error={erreursMotDePasse.confirm_password}
                  disabled={envoiMotDePasse}
                  leadingIcon={Lock}
                />

                <Button type="submit" variant="primary" loading={envoiMotDePasse}>
                  <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                  Modifier le mot de passe
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-2 text-sm text-slate-700">
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                <GraduationCap aria-hidden="true" className="h-5 w-5 text-brand-700" />
                Votre compte
              </p>
              <p>
                Rôle : <strong>{LIBELLES_ROLE[role] ?? role}</strong>. Ce rôle est
                attribué par l’administration et ne peut pas être modifié depuis cette
                page.
              </p>
              <p>
                Si vous devez changer de cours ou de niveau d’accès, contactez votre
                enseignant ou l’administration.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </Page>
  );
}

export default Profil;
