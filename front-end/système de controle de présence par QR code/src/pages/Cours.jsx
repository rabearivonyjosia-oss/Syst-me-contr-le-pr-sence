import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import CoursForm from '../components/forms/CoursForm.jsx';
import {
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Modal,
  PageHeader,
  Select,
  SkeletonCarte,
} from '../components/ui/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useRequete } from '../hooks/useRequete.js';
import { useToast } from '../context/ToastContext.jsx';
import { authApi, coursApi, messageDepuisErreur } from '../services/api.js';
import { NIVEAUX } from '../utils/constants.js';

function Cours() {
  const { estGestionnaire, estAdmin } = useAuth();
  const { succes, erreur: notifierErreur } = useToast();
  const [niveauFiltre, setNiveauFiltre] = useState('');
  const [edition, setEdition] = useState(null);
  const [suppression, setSuppression] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  usePageTitle('Cours');

  const charger = useCallback(async () => {
    const [liste, enseignants] = await Promise.all([
      coursApi.list({ page_size: 100 }),
      estAdmin ? authApi.utilisateurs('ENSEIGNANT') : Promise.resolve([]),
    ]);
    return { cours: liste.results ?? [], enseignants };
  }, [estAdmin]);

  const { donnees, chargement, erreur, recharger } = useRequete(charger);

  const cours = useMemo(() => donnees?.cours ?? [], [donnees]);
  const enseignants = donnees?.enseignants ?? [];
  const coursFiltres = useMemo(
    () => (niveauFiltre ? cours.filter((item) => item.niveau === niveauFiltre) : cours),
    [cours, niveauFiltre],
  );

  const supprimer = async () => {
    if (!suppression) return;
    setSuppressionEnCours(true);
    try {
      await coursApi.remove(suppression.id);
      succes(`Le cours « ${suppression.nom_cours} » a été supprimé.`);
      setSuppression(null);
      recharger();
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
        cle: 'nom_cours',
        entete: 'Cours',
        rendu: (ligne) => (
          <Link
            to={`/cours/${ligne.id}`}
            className="font-semibold text-brand-700 no-underline hover:underline"
          >
            {ligne.nom_cours}
          </Link>
        ),
      },
      {
        cle: 'niveau_libelle',
        entete: 'Niveau',
        valeur: (ligne) => ligne.niveau_libelle || ligne.niveau,
      },
      {
        cle: 'enseignant_nom',
        entete: 'Enseignant',
        rendu: (ligne) => ligne.enseignant_nom || '—',
      },
      {
        cle: 'nb_etudiants',
        entete: 'Étudiants',
        rendu: (ligne) => (
          <span className="inline-flex items-center gap-1.5">
            <Users aria-hidden="true" className="h-4 w-4 text-slate-500" />
            {ligne.nb_etudiants}
          </span>
        ),
      },
      {
        cle: 'nb_seances',
        entete: 'Séances',
        rendu: (ligne) => (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-slate-500" />
            {ligne.nb_seances}
          </span>
        ),
      },
      {
        cle: 'actions',
        entete: 'Actions',
        triable: false,
        rendu: (ligne) => (
          <div className="flex flex-wrap items-center gap-1">
            <Link
              to={`/cours/${ligne.id}`}
              className="inline-flex min-h-[36px] items-center rounded-app px-2 text-sm font-semibold text-brand-700 no-underline hover:bg-brand-50"
            >
              Ouvrir
            </Link>
            {estGestionnaire && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEdition({ cours: ligne })}
                  aria-label={`Modifier le cours ${ligne.nom_cours}`}
                  title="Modifier"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-700 hover:bg-danger-50"
                  onClick={() => setSuppression(ligne)}
                  aria-label={`Supprimer le cours ${ligne.nom_cours}`}
                  title="Supprimer"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [estGestionnaire],
  );

  return (
    <Page>
      <PageHeader
        titre="Cours"
        description={
          estGestionnaire
            ? 'Créez vos cours, inscrivez les étudiants et retrouvez leurs séances.'
            : 'Retrouvez les cours auxquels vous êtes inscrit et leur planning.'
        }
        icone={BookOpen}
        action={
          estGestionnaire ? (
            <Button variant="primary" onClick={() => setEdition({ cours: null })}>
              <Plus aria-hidden="true" className="h-5 w-5" />
              Nouveau cours
            </Button>
          ) : undefined
        }
      />

      {chargement && (
        <div className="space-y-3">
          <SkeletonCarte />
          <SkeletonCarte />
          <SkeletonCarte />
        </div>
      )}

      {!chargement && erreur && (
        <ErrorState
          titre="Impossible de charger les cours"
          erreur={erreur}
          onRetry={recharger}
        />
      )}

      {!chargement && !erreur && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Select
              id="filtre-niveau-cours"
              label="Filtrer par niveau"
              value={niveauFiltre}
              onChange={(event) => setNiveauFiltre(event.target.value)}
              className="w-full sm:max-w-xs"
            >
              <option value="">Tous les niveaux</option>
              {NIVEAUX.map((niveau) => (
                <option key={niveau.value} value={niveau.value}>
                  {niveau.label}
                </option>
              ))}
            </Select>
            <p className="text-sm text-slate-600" role="status">
              {coursFiltres.length} cours affiché{coursFiltres.length > 1 ? 's' : ''}
            </p>
          </div>

          <DataTable
            titre="Liste des cours"
            colonnes={colonnes}
            lignes={coursFiltres}
            libelleRecherche="Rechercher un cours"
            placeholderRecherche="Nom du cours, enseignant…"
            rechercheDans={['nom_cours', 'niveau_libelle', 'enseignant_nom']}
            parPage={8}
            vide={
              <EmptyState
                icon={BookOpen}
                title={niveauFiltre ? 'Aucun cours pour ce niveau' : 'Aucun cours pour l’instant'}
                description={
                  niveauFiltre
                    ? 'Modifiez le filtre de niveau pour voir d’autres cours.'
                    : estGestionnaire
                      ? 'Créez votre premier cours pour planifier des séances et suivre les présences.'
                      : 'Votre enseignant ne vous a pas encore inscrit à un cours.'
                }
                action={
                  estGestionnaire && !niveauFiltre ? (
                    <Button variant="primary" onClick={() => setEdition({ cours: null })}>
                      <Plus aria-hidden="true" className="h-5 w-5" />
                      Créer un cours
                    </Button>
                  ) : niveauFiltre ? (
                    <Button variant="secondary" onClick={() => setNiveauFiltre('')}>
                      Afficher tous les cours
                    </Button>
                  ) : undefined
                }
              />
            }
          />
        </>
      )}

      <Modal
        open={Boolean(edition)}
        onClose={() => setEdition(null)}
        title={edition?.cours ? 'Modifier le cours' : 'Nouveau cours'}
        description={
          edition?.cours
            ? 'Les séances et les présences déjà enregistrées sont conservées.'
            : 'Un cours regroupe un enseignant, des étudiants et des séances.'
        }
      >
        {edition && (
          <CoursForm
            key={edition.cours?.id ?? 'nouveau'}
            cours={edition.cours}
            enseignants={enseignants}
            estAdmin={estAdmin}
            onFermer={() => setEdition(null)}
            onReussi={recharger}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(suppression)}
        titre="Supprimer ce cours ?"
        description={
          suppression
            ? `Le cours « ${suppression.nom_cours} », ses séances et toutes les présences associées seront définitivement supprimés.`
            : ''
        }
        libelleConfirmer="Supprimer le cours"
        onConfirmer={supprimer}
        onAnnuler={() => setSuppression(null)}
        chargement={suppressionEnCours}
      >
        <p className="text-sm text-slate-600">
          Cette action est irréversible. Vérifiez qu’aucune donnée ne doit être conservée.
        </p>
      </ConfirmDialog>
    </Page>
  );
}

export default Cours;
