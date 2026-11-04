import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  GraduationCap,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  UserRound,
  Users,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import CoursForm from '../components/forms/CoursForm.jsx';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  PageHeader,
  SkeletonCarte,
  StatutPresenceBadge,
  StatutSeanceBadge,
} from '../components/ui/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useRequete } from '../hooks/useRequete.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  authApi,
  coursApi,
  messageDepuisErreur,
} from '../services/api.js';
import { TYPES_SEANCE } from '../utils/constants.js';
import { formatDate, formatPlage } from '../utils/format.js';

/** Inscriptions : liste des inscrits et ajout d'étudiants disponibles. */
function GestionInscriptions({ coursId, onModifie }) {
  const { succes, erreur: notifierErreur } = useToast();
  const [recherche, setRecherche] = useState('');
  const [rechercheAppliquee, setRechercheAppliquee] = useState('');
  const [ajoutEnCours, setAjoutEnCours] = useState(null);
  const [retrait, setRetrait] = useState(null);
  const [retraitEnCours, setRetraitEnCours] = useState(false);

  const charger = useCallback(async () => {
    const [inscrits, disponibles] = await Promise.all([
      coursApi.etudiants(coursId),
      coursApi.etudiantsDisponibles(coursId, rechercheAppliquee),
    ]);
    return { inscrits, disponibles };
  }, [coursId, rechercheAppliquee]);

  const { donnees, chargement, erreur, recharger } = useRequete(charger);

  const inscrits = donnees?.inscrits ?? [];
  const disponibles = donnees?.disponibles ?? [];

  const rechercher = (event) => {
    event.preventDefault();
    setRechercheAppliquee(recherche.trim());
    recharger();
  };

  const ajouter = async (etudiant) => {
    setAjoutEnCours(etudiant.id);
    try {
      await coursApi.inscrire(coursId, [etudiant.id]);
      succes(`${etudiant.nom_complet || etudiant.username} a été inscrit au cours.`);
      recharger();
      onModifie();
    } catch (probleme) {
      notifierErreur(
        messageDepuisErreur(
          probleme,
          'Impossible d’inscrire cet étudiant. Réessayez dans un instant.',
        ),
      );
    } finally {
      setAjoutEnCours(null);
    }
  };

  const retirer = async () => {
    if (!retrait) return;
    setRetraitEnCours(true);
    try {
      await coursApi.desinscrire(coursId, [retrait.id]);
      succes(`${retrait.nom_complet || retrait.username} a été retiré du cours.`);
      setRetrait(null);
      recharger();
      onModifie();
    } catch (probleme) {
      notifierErreur(
        messageDepuisErreur(
          probleme,
          'Impossible de retirer cet étudiant. Réessayez dans un instant.',
        ),
      );
    } finally {
      setRetraitEnCours(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Étudiants inscrits"
        description="Les étudiants inscrits peuvent scanner le QR code des séances de ce cours."
        action={<Badge variant="info">{inscrits.length} inscrit{inscrits.length > 1 ? 's' : ''}</Badge>}
      />

      <CardBody className="space-y-6">
        {erreur && (
          <ErrorState
            titre="Impossible de charger les inscriptions"
            erreur={erreur}
            onRetry={recharger}
          />
        )}

        {!erreur && (
          <>
            <section aria-labelledby="inscrits-titre" className="space-y-3">
              <h3 id="inscrits-titre" className="text-lg font-bold text-slate-900">
                Inscrits au cours
              </h3>
              {chargement ? (
                <p className="text-sm text-slate-600" role="status">
                  Chargement des étudiants…
                </p>
              ) : inscrits.length === 0 ? (
                <p className="rounded-app border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-600">
                  Aucun étudiant n’est encore inscrit. Ajoutez-en depuis la liste ci-dessous.
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 rounded-app border border-slate-200">
                  {inscrits.map((etudiant) => (
                    <li
                      key={etudiant.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {etudiant.nom_complet || etudiant.username}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                            {etudiant.email}
                          </span>
                          {etudiant.num_matricule && (
                            <span>Matricule {etudiant.num_matricule}</span>
                          )}
                          {etudiant.niveau_libelle && <span>{etudiant.niveau_libelle}</span>}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger-700 hover:bg-danger-50"
                        onClick={() => setRetrait(etudiant)}
                        aria-label={`Retirer ${etudiant.nom_complet || etudiant.username} du cours`}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Retirer
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="ajout-titre" className="space-y-3">
              <h3 id="ajout-titre" className="text-lg font-bold text-slate-900">
                Ajouter un étudiant
              </h3>
              <form onSubmit={rechercher} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Input
                  id="recherche-etudiant"
                  label="Rechercher un étudiant"
                  type="search"
                  value={recherche}
                  onChange={(event) => setRecherche(event.target.value)}
                  placeholder="Nom, email ou matricule"
                  leadingIcon={Search}
                  className="w-full sm:max-w-md"
                />
                <Button type="submit" variant="secondary">
                  Rechercher
                </Button>
              </form>

              {disponibles.length === 0 ? (
                <p className="rounded-app border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-600">
                  {rechercheAppliquee
                    ? 'Aucun étudiant disponible ne correspond à cette recherche.'
                    : 'Tous les étudiants disponibles sont déjà inscrits à ce cours.'}
                </p>
              ) : (
                <ul className="divide-y divide-slate-200 rounded-app border border-slate-200">
                  {disponibles.map((etudiant) => (
                    <li
                      key={etudiant.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {etudiant.nom_complet || etudiant.username}
                        </p>
                        <p className="text-sm text-slate-600">
                          {etudiant.email}
                          {etudiant.num_matricule ? ` · ${etudiant.num_matricule}` : ''}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={ajoutEnCours === etudiant.id}
                        onClick={() => ajouter(etudiant)}
                        aria-label={`Inscrire ${etudiant.nom_complet || etudiant.username}`}
                      >
                        <UserPlus aria-hidden="true" className="h-4 w-4" />
                        Inscrire
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-slate-600">
                La liste est limitée aux 100 premiers résultats. Affinez la recherche si besoin.
              </p>
            </section>
          </>
        )}
      </CardBody>

      <ConfirmDialog
        open={Boolean(retrait)}
        titre="Retirer cet étudiant ?"
        description={
          retrait
            ? `${retrait.nom_complet || retrait.username} ne pourra plus scanner les séances de ce cours. Ses présences déjà enregistrées sont conservées.`
            : ''
        }
        libelleConfirmer="Retirer du cours"
        onConfirmer={retirer}
        onAnnuler={() => setRetrait(null)}
        chargement={retraitEnCours}
      />
    </Card>
  );
}

function CoursDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estGestionnaire, estAdmin, estEtudiant, utilisateur } = useAuth();
  const { succes, erreur: notifierErreur } = useToast();
  const [edition, setEdition] = useState(false);
  const [suppression, setSuppression] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  usePageTitle('Détail du cours');

  const charger = useCallback(async () => {
    const [details, seances, enseignants] = await Promise.all([
      coursApi.get(id),
      coursApi.seances(id),
      estAdmin ? authApi.utilisateurs('ENSEIGNANT') : Promise.resolve([]),
    ]);
    return { cours: details, seances: Array.isArray(seances) ? seances : seances.results ?? [], enseignants };
  }, [id, estAdmin]);

  const { donnees, chargement, erreur, recharger } = useRequete(charger);

  const cours = donnees?.cours;
  const seances = donnees?.seances ?? [];
  const enseignants = donnees?.enseignants ?? [];
  const estProprietaire = estAdmin || cours?.enseignant === utilisateur?.id;

  const supprimer = async () => {
    setSuppressionEnCours(true);
    try {
      await coursApi.remove(id);
      succes(`Le cours « ${cours?.nom_cours ?? ''} » a été supprimé.`);
      navigate('/cours', { replace: true });
    } catch (probleme) {
      notifierErreur(
        messageDepuisErreur(
          probleme,
          'Impossible de supprimer ce cours. Réessayez dans un instant.',
        ),
      );
    } finally {
      setSuppressionEnCours(false);
    }
  };

  const colonnes = useMemo(
    () => [
      {
        cle: 'date_seance',
        entete: 'Date',
        rendu: (ligne) => (
          <span className="font-medium text-slate-900">{formatDate(ligne.date_seance)}</span>
        ),
      },
      {
        cle: 'heure_debut',
        entete: 'Horaire',
        rendu: (ligne) => formatPlage(ligne.heure_debut, ligne.heure_fin),
      },
      { cle: 'salle', entete: 'Salle', rendu: (ligne) => ligne.salle || '—' },
      {
        cle: 'type_seance',
        entete: 'Type',
        rendu: (ligne) =>
          ligne.type_seance_libelle ||
          TYPES_SEANCE.find((type) => type.value === ligne.type_seance)?.label ||
          ligne.type_seance,
      },
      {
        cle: 'statut',
        entete: 'Statut',
        rendu: (ligne) => (
          <div className="flex flex-wrap items-center gap-1.5">
            <StatutSeanceBadge statut={ligne.statut} />
            {estEtudiant && ligne.ma_presence && (
              <StatutPresenceBadge statut={ligne.ma_presence.statut} />
            )}
          </div>
        ),
      },
      {
        cle: 'actions',
        entete: 'Actions',
        triable: false,
        rendu: (ligne) => (
          <Link
            to={`/seances/${ligne.id}`}
            className="inline-flex min-h-[36px] items-center rounded-app px-2 text-sm font-semibold text-brand-700 no-underline hover:bg-brand-50"
          >
            Ouvrir la séance
          </Link>
        ),
      },
    ],
    [estEtudiant],
  );

  if (chargement) {
    return (
      <Page>
        <SkeletonCarte className="h-32" />
        <SkeletonCarte className="h-64" />
      </Page>
    );
  }

  if (erreur) {
    return (
      <Page>
        <ErrorState
          titre="Impossible de charger ce cours"
          erreur={erreur}
          onRetry={recharger}
        />
        <div>
          <Button variant="secondary" onClick={() => navigate('/cours')}>
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            Retour aux cours
          </Button>
        </div>
      </Page>
    );
  }

  if (!cours) return null;

  return (
    <Page>
      <PageHeader
        titre={cours.nom_cours}
        description={`${cours.niveau_libelle || cours.niveau} · ${
          cours.enseignant_nom || 'Enseignant non renseigné'
        }`}
        icone={BookOpen}
        fil={[{ label: 'Cours', to: '/cours' }, { label: cours.nom_cours }]}
        action={
          estGestionnaire && estProprietaire ? (
            <Button
              variant="primary"
              onClick={() => navigate(`/seances?cours=${cours.id}&nouvelle=1`)}
            >
              <CalendarPlus aria-hidden="true" className="h-5 w-5" />
              Planifier une séance
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm font-semibold text-slate-600">Étudiants inscrits</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold tabular-nums text-slate-900">
            <Users aria-hidden="true" className="h-6 w-6 text-brand-700" />
            {cours.nb_etudiants}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-semibold text-slate-600">Séances planifiées</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold tabular-nums text-slate-900">
            <CalendarDays aria-hidden="true" className="h-6 w-6 text-brand-700" />
            {cours.nb_seances}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-semibold text-slate-600">Niveau</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <GraduationCap aria-hidden="true" className="h-6 w-6 text-brand-700" />
            {cours.niveau_libelle || cours.niveau}
          </p>
        </Card>
      </div>

      {estGestionnaire && estProprietaire && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setEdition(true)}>
            <Pencil aria-hidden="true" className="h-5 w-5" />
            Modifier le cours
          </Button>
          <Button
            variant="ghost"
            className="text-danger-700 hover:bg-danger-50"
            onClick={() => setSuppression(true)}
          >
            <Trash2 aria-hidden="true" className="h-5 w-5" />
            Supprimer le cours
          </Button>
        </div>
      )}

      <section aria-labelledby="seances-cours-titre" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="seances-cours-titre" className="text-xl font-bold text-slate-900">
            Séances du cours
          </h2>
          <Link to={`/seances?cours=${cours.id}`} className="text-sm font-semibold text-brand-700">
            Toutes les séances
          </Link>
        </div>

        <DataTable
          titre={`Séances du cours ${cours.nom_cours}`}
          colonnes={colonnes}
          lignes={seances}
          libelleRecherche="Rechercher une séance"
          placeholderRecherche="Date, salle, type…"
          rechercheDans={['date_seance', 'salle', 'type_seance']}
          parPage={6}
          vide={
            <EmptyState
              icon={CalendarDays}
              title="Aucune séance planifiée"
              description={
                estGestionnaire
                  ? 'Planifiez la première séance de ce cours pour pouvoir projeter un QR code.'
                  : 'Aucune séance n’est encore planifiée pour ce cours.'
              }
              action={
                estGestionnaire && estProprietaire ? (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/seances?cours=${cours.id}&nouvelle=1`)}
                  >
                    <Plus aria-hidden="true" className="h-5 w-5" />
                    Planifier une séance
                  </Button>
                ) : undefined
              }
            />
          }
        />
      </section>

      {estGestionnaire && estProprietaire && (
        <GestionInscriptions coursId={cours.id} onModifie={recharger} />
      )}

      {!estGestionnaire && (
        <Card>
          <CardHeader
            title="Votre inscription"
            description="Vous êtes inscrit à ce cours : vous pouvez scanner le QR code pendant les séances."
          />
          <CardBody className="flex items-center gap-3 text-sm text-slate-700">
            <UserRound aria-hidden="true" className="h-5 w-5 text-brand-700" />
            <span>
              Vos présences apparaissent dans la liste des séances ci-dessus, puis dans vos
              statistiques personnelles.
            </span>
          </CardBody>
        </Card>
      )}

      <Modal
        open={edition}
        onClose={() => setEdition(false)}
        title="Modifier le cours"
        description="Les séances et les présences déjà enregistrées sont conservées."
      >
        {edition && (
          <CoursForm
            key={cours.id}
            cours={cours}
            enseignants={enseignants}
            estAdmin={estAdmin}
            onFermer={() => setEdition(false)}
            onReussi={recharger}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={suppression}
        titre="Supprimer ce cours ?"
        description={`Le cours « ${cours.nom_cours} », ses séances et toutes les présences associées seront définitivement supprimés.`}
        libelleConfirmer="Supprimer le cours"
        onConfirmer={supprimer}
        onAnnuler={() => setSuppression(false)}
        chargement={suppressionEnCours}
      >
        <p className="text-sm text-slate-600">
          Cette action est irréversible. Vérifiez qu’aucune donnée ne doit être conservée.
        </p>
      </ConfirmDialog>
    </Page>
  );
}

export default CoursDetail;
