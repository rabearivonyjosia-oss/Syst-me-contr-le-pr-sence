import { useEffect, useState } from 'react';
import {
  Award,
  ChevronRight,
  Hash,
  Key,
  LogOut,
  Mail,
  Pencil,
  Shield,
  User,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Alert, Button, Card, EmptyState, Input, Select, Spinner } from '../components/ui/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import apiClient, { messageDepuisErreur } from '../services/api.js';

/*
 * Page « Mon profil » (Phase 3).
 * Backend inchangé : l'endpoint /api/profile/ n'existe pas encore côté serveur.
 * - Sans profil serveur : affiche un état vide explicite et ne montre AUCUNE
 *   valeur factice (remplace l'ancien « abc@gmail.com » de profile.jsx).
 * - Dès que l'API existe, GET /api/profile/ alimente l'affichage ; PATCH /api/profile/
 *   et POST /api/profile/change-password/ (ou PUT : le frontend suit les deux
 *   conventions connues) apparaissent dès qu'ils répondent.
 * - Wording canonique : « Présence QR » (marque), étiquettes de rôle uniquement.
 */

const NIVEAU_OPTIONS = [
  { value: '', label: 'Choisir…' },
  { value: 'L1', label: 'Licence 1' },
  { value: 'L2', label: 'Licence 2' },
  { value: 'L3', label: 'Licence 3' },
  { value: 'M1', label: 'Master 1' },
  { value: 'M2', label: 'Master 2' },
];

const ROLE_LABELS = {
  ETUDIANT: 'Étudiant',
  ENSEIGNANT: 'Enseignant',
  ADMIN: 'Administrateur',
};

function ProfilPage() {
  const { profil, role, deconnexion, fetchProfile } = useAuth();
  const [mode, setMode] = useState('affichage'); // affichage | edition | mot-de-passe
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState('');
  const [erreur, setErreur] = useState('');
  const [erreurChargement, setErreurChargement] = useState('');
  const [chargement, setChargement] = useState(true);

  // Formulaire (edit) — champs mappés sur User/Profile, sans surprise.
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [niveau, setNiveau] = useState('');
  const [numMatricule, setNumMatricule] = useState('');
  const [telephone, setTelephone] = useState('');

  // Changement de mot de passe.
  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreursMdp, setErreursMdp] = useState({});

  const initialiser = (donnees) => {
    setUsername(donnees?.username || '');
    setEmail(donnees?.email || '');
    setNiveau(donnees?.niveau || '');
    setNumMatricule(donnees?.num_matricule || donnees?.matricule || '');
    setTelephone(donnees?.telephone || '');
  };

  useEffect(() => {
    let actif = true;
    (async () => {
      try {
        const donnees = await fetchProfile();
        if (!actif) return;
        if (donnees) initialiser(donnees);
      } catch (err) {
        if (!actif) return;
        setErreurChargement(
          messageDepuisErreur(err, 'Le profil n’est pas encore disponible côté serveur.'),
        );
      } finally {
        if (actif) setChargement(false);
      }
    })();
    return () => {
      actif = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profil) initialiser(profil);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profil]);

  const estEtudiant = role === 'ETUDIANT';

  const sauvegarder = async (e) => {
    e.preventDefault();
    setSucces('');
    setErreur('');
    setEnvoi(true);
    try {
      const payload = {
        username,
        email,
        niveau: niveau || null,
        num_matricule: numMatricule || null,
        telephone: telephone || null,
      };
      const reponse = await apiClient.patch('/api/profile/', payload);
      initialiser(reponse.data);
      setSucces('Profil enregistré avec succès. Vos informations sont à jour.');
      setMode('affichage');
    } catch (err) {
      setErreur(
        messageDepuisErreur(err, 'Impossible d’enregistrer le profil. Vérifiez les informations puis réessayez.'),
      );
    } finally {
      setEnvoi(false);
    }
  };

  const changerMotDePasse = async (e) => {
    e.preventDefault();
    setSucces('');
    setErreur('');
    const erreurs = {};
    if (!ancien) erreurs.ancien = 'Saisissez votre mot de passe actuel.';
    if (nouveau.length < 8) erreurs.nouveau = 'Le nouveau mot de passe doit comporter au moins 8 caractères.';
    if (nouveau !== confirmation) erreurs.confirmation = 'La confirmation ne correspond pas au nouveau mot de passe.';
    setErreursMdp(erreurs);
    if (Object.keys(erreurs).length > 0) return;

    setEnvoi(true);
    try {
      const payload = { current_password: ancien, new_password: nouveau, confirm_password: confirmation };
      try {
        await apiClient.post('/api/profile/change-password/', payload);
      } catch (errPremier) {
        // Convention alternative (certains backends attendent PUT) : ne retente
        // que si la première méthode a été refusée par le serveur.
        if (errPremier?.response?.status !== 405) throw errPremier;
        await apiClient.put('/api/profile/change-password/', payload);
      }
      setAncien('');
      setNouveau('');
      setConfirmation('');
      setSucces('Mot de passe modifié avec succès. Utilisez-le lors de votre prochaine connexion.');
      setMode('affichage');
    } catch (err) {
      setErreur(
        messageDepuisErreur(err, 'Impossible de modifier le mot de passe. Vérifiez le mot actuel puis réessayez.'),
      );
    } finally {
      setEnvoi(false);
    }
  };

  const details = [
    { icon: Mail, label: 'Email', valeur: email || 'Non renseigné' },
    ...(estEtudiant || numMatricule
      ? [{ icon: Hash, label: 'Numéro matricule', valeur: numMatricule || 'Non renseigné' }]
      : []),
    ...(estEtudiant
      ? [{ icon: Award, label: 'Niveau', valeur: niveau ? (NIVEAU_OPTIONS.find((o) => o.value === niveau)?.label || niveau) : 'Non renseigné' }]
      : []),
    { icon: Shield, label: 'Rôle', valeur: ROLE_LABELS[role] || 'Utilisateur' },
    ...(telephone
      ? [{ icon: User, label: 'Téléphone', valeur: telephone }]
      : []),
  ];

  return (
    <AppLayout currentPage="profil">
      <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8" aria-labelledby="profil-titre">
        <div className="space-y-1">
          <h1 id="profil-titre" className="text-2xl font-bold tracking-tight text-slate-900">Mon profil</h1>
          <p className="max-w-prose65 text-base text-slate-600">
            Vos informations personnelles pour Présence QR, lisibles et modifiables en quelques touches.
          </p>
        </div>

        {succes && (
          <Alert variant="success" title="Enregistré">
            {succes}
          </Alert>
        )}
        {erreur && (
          <Alert variant="danger" title="Action impossible">
            {erreur}
          </Alert>
        )}

        {chargement ? (
          <Spinner label="Chargement du profil…" />
        ) : erreurChargement ? (
          <EmptyState
            icon={User}
            title="Profil indisponible pour le moment"
            description={erreurChargement}
            action={
              <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            }
          />
        ) : mode === 'edition' ? (
          <form onSubmit={sauvegarder} className="space-y-4" aria-label="Modifier mon profil">
            <Card className="space-y-4 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Modifier mon profil</h2>
              <Input
                id="profil-username"
                label="Nom d’utilisateur"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leadingIcon={User}
              />
              <Input
                id="profil-email"
                label="Adresse email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leadingIcon={Mail}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  id="profil-niveau"
                  label="Niveau"
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                >
                  {NIVEAU_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <Input
                  id="profil-matricule"
                  label="Numéro matricule"
                  value={numMatricule}
                  onChange={(e) => setNumMatricule(e.target.value)}
                  leadingIcon={Hash}
                />
              </div>
              <Input
                id="profil-telephone"
                label="Téléphone (optionnel)"
                type="tel"
                autoComplete="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </Card>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" size="md" loading={envoi}>
                Enregistrer
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={() => setMode('affichage')} disabled={envoi}>
                Annuler
              </Button>
            </div>
          </form>
        ) : mode === 'mot-de-passe' ? (
          <form onSubmit={changerMotDePasse} className="space-y-4" aria-label="Changer de mot de passe">
            <Card className="space-y-4 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Changer de mot de passe</h2>
              <Input
                id="profil-ancien"
                label="Mot de passe actuel"
                type="password"
                autoComplete="current-password"
                required
                value={ancien}
                onChange={(e) => setAncien(e.target.value)}
                leadingIcon={Key}
                error={erreursMdp.ancien}
              />
              <Input
                id="profil-nouveau"
                label="Nouveau mot de passe"
                type="password"
                autoComplete="new-password"
                required
                hint="Au moins 8 caractères."
                value={nouveau}
                onChange={(e) => setNouveau(e.target.value)}
                leadingIcon={Key}
                error={erreursMdp.nouveau}
              />
              <Input
                id="profil-confirmation"
                label="Confirmer le nouveau mot de passe"
                type="password"
                autoComplete="new-password"
                required
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                leadingIcon={Key}
                error={erreursMdp.confirmation}
              />
            </Card>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" size="md" loading={envoi}>
                Mettre à jour
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={() => setMode('affichage')} disabled={envoi}>
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* Carte d'identité — aucune donnée factice : si le profil serveur
                est absent, on affiche seulement le rôle connu côté client. */}
            <Card className="flex flex-wrap items-center gap-4 p-5 sm:p-6">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-app bg-brand-50 text-brand-700"
              >
                <User className="h-8 w-8" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 space-y-1">
                <h2 className="truncate text-xl font-bold text-slate-900">
                  {username || email || 'Mon compte'}
                </h2>
                <p className="text-base text-slate-600">
                  {ROLE_LABELS[role] || 'Utilisateur'} — Présence QR
                </p>
              </div>
            </Card>

            <section aria-labelledby="profil-informations" className="space-y-3">
              <h2 id="profil-informations" className="text-xl font-bold text-slate-900">
                Mes informations
              </h2>
              <Card className="divide-y divide-slate-100 p-0">
                {details.map(({ icon: Icone, label, valeur }) => (
                  <div key={label} className="flex items-center justify-between gap-4 p-4">
                    <span className="flex min-w-0 items-center gap-3 text-slate-600">
                      <Icone aria-hidden="true" className="h-5 w-5 shrink-0" />
                      <span className="text-base">{label}</span>
                    </span>
                    <span className="truncate text-right text-base font-medium text-slate-900">{valeur}</span>
                  </div>
                ))}
              </Card>
            </section>

            <section aria-labelledby="profil-parametres" className="space-y-3">
              <h2 id="profil-parametres" className="text-xl font-bold text-slate-900">
                Paramètres
              </h2>
              <Card className="divide-y divide-slate-100 p-0">
                <button
                  type="button"
                  onClick={() => { setSucces(''); setErreur(''); setMode('edition'); }}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3 text-slate-700">
                    <Pencil aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" />
                    <span className="text-base font-medium">Modifier mon profil</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="h-5 w-5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => { setSucces(''); setErreur(''); setMode('mot-de-passe'); }}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3 text-slate-700">
                    <Key aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-500" />
                    <span className="text-base font-medium">Changer de mot de passe</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="h-5 w-5 text-slate-400" />
                </button>
              </Card>
            </section>

            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={deconnexion}
              className="w-full text-danger-700 hover:bg-danger-50 sm:w-auto"
            >
              <LogOut aria-hidden="true" className="h-5 w-5" />
              <span>Déconnexion</span>
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default ProfilPage;
