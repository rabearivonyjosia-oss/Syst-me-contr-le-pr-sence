import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Pencil,
  Plus,
  QrCode,
  Trash2,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import SeanceForm from '../components/forms/SeanceForm.jsx';
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
  StatutPresenceBadge,
  StatutSeanceBadge,
} from '../components/ui/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useRequete } from '../hooks/useRequete.js';
import { useToast } from '../context/ToastContext.jsx';
import { coursApi, messageDepuisErreur, seancesApi } from '../services/api.js';
import { STATUTS_SEANCE, TYPES_SEANCE } from '../utils/constants.js';
import { formatDate, formatPlage } from '../utils/format.js';

function Seances() {
  const { estGestionnaire, estEtudiant } = useAuth();
  const { succes, erreur: notifierErreur } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const coursDepuisUrl = searchParams.get('cours') ?? '';
  const nouvelleDepuisUrl = searchParams.get('nouvelle') === '1';

  const [coursFiltre, setCoursFiltre] = useState(coursDepuisUrl);
  const [statutFiltre, setStatutFiltre] = useState('');
  const [edition, setEdition] = useState(() =>
    nouvelleDepuisUrl ? { seance: null, coursInitial: coursDepuisUrl } : null,
  );
  const [suppression, setSuppression] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  usePageTitle('Séances');

  useEffect(() => {
    // Synchronisation ponctuelle avec les paramètres d'URL : la page peut être
    // ouverte depuis un cours avec un filtre ou le formulaire déjà demandé.
    /* eslint-disable react-hooks/set-state-in-effect */
    setCoursFiltre(coursDepuisUrl);
    if (nouvelleDepuisUrl) {
      setEdition({ seance: null, coursInitial: coursDepuisUrl });
      setSearchParams(coursDepuisUrl ? { cours: coursDepuisUrl } : {}, { replace: true });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [coursDepuisUrl, nouvelleDepuisUrl, setSearchParams]);

  const charger = useCallback(async () => {
    const [listeSeances, listeCours] = await Promise.all([
      seancesApi.list({ page_size: 100, ordering: 'date_seance,heure_debut' }),
      coursApi.list({ page_size: 100 }),
    ]);
    return {
      seances: listeSeances.results ?? [],
      cours: listeCours.results ?? [],
    };
  }, []);

  const { donnees, chargement, erreur, recharger } = useRequete(charger);

  const seances = useMemo(() => donnees?.seances ?? [], [donnees]);
  const cours = donnees?.cours ?? [];

  const seancesFiltrees = useMemo(
    () =>
      seances.filter((seance) => {
        if (coursFiltre && String(seance.cours) !== String(coursFiltre)) return false;
        if (statutFiltre && seance.statut !== statutFiltre) return false;
        return true;
      }),
    [seances, coursFiltre, statutFiltre],
  );

  const changerCours = (valeur) => {
    setCoursFiltre(valeur);
    setSearchParams(valeur ? { cours: valeur } : {}, { replace: true });
  };

  const supprimer = async () => {
    if (!suppression) return;
    setSuppressionEnCours(true);
    try {
      await seancesApi.remove(suppression.id);
      succes('La séance a été supprimée.');
      setSuppression(null);
      recharger();
    } catch (probleme) {
      notifierErreur(
        messageDepuisErreur(
          probleme,
          'Impossible de supprimer cette séance. Réessayez dans un instant.',
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
        cle: 'cours_nom',
        entete: 'Cours',
        rendu: (ligne) => (
          <Link
            to={`/cours/${ligne.cours}`}
            className="font-semibold text-brand-700 no-underline hover:underline"
          >
            {ligne.cours_nom}
          </Link>
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
        masquerMobile: true,
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
      ...(estGestionnaire
        ? [
            {
              cle: 'presents',
              entete: 'Présents',
              triable: false,
              rendu: (ligne) => (
                <span className="tabular-nums text-slate-800">
                  {ligne.nb_presents} / {ligne.nb_etudiants}
                </span>
              ),
            },
          ]
        : []),
      {
        cle: 'actions',
        entete: 'Actions',
        triable: false,
        rendu: (ligne) => (
          <div className="flex flex-wrap items-center gap-1">
            <Link
              to={`/seances/${ligne.id}`}
              className="inline-flex min-h-[36px] items-center rounded-app px-2 text-sm font-semibold text-brand-700 no-underline hover:bg-brand-50"
            >
              Ouvrir
            </Link>
            {estGestionnaire && (
              <>
                <Link
                  to={`/seances/${ligne.id}/qr`}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-app px-2 text-sm font-semibold text-brand-700 no-underline hover:bg-brand-50"
                  aria-label={`Afficher le QR code de la séance ${ligne.cours_nom} du ${formatDate(ligne.date_seance)}`}
                >
                  <QrCode aria-hidden="true" className="h-4 w-4" />
                  QR
                </Link>
                <Link
                  to={`/seances/${ligne.id}/presences`}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-app px-2 text-sm font-semibold text-brand-700 no-underline hover:bg-brand-50"
                  aria-label={`Ouvrir la feuille de présence de la séance ${ligne.cours_nom} du ${formatDate(ligne.date_seance)}`}
                >
                  <ClipboardList aria-hidden="true" className="h-4 w-4" />
                  Feuille
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEdition({ seance: ligne, coursInitial: '' })}
                  aria-label={`Modifier la séance ${ligne.cours_nom} du ${formatDate(ligne.date_seance)}`}
                  title="Modifier"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-700 hover:bg-danger-50"
                  onClick={() => setSuppression(ligne)}
                  aria-label={`Supprimer la séance ${ligne.cours_nom} du ${formatDate(ligne.date_seance)}`}
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
    [estGestionnaire, estEtudiant],
  );

  return (
    <Page>
      <PageHeader
        titre="Séances"
        description={
          estGestionnaire
            ? 'Planifiez les séances, projetez le QR code et corrigez les présences.'
            : 'Consultez le planning de vos cours et votre statut de présence.'
        }
        icone={CalendarDays}
        action={
          estGestionnaire ? (
            <Button
              variant="primary"
              onClick={() =>
                setEdition({ seance: null, coursInitial: coursFiltre || '' })
              }
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
              Nouvelle séance
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
          titre="Impossible de charger les séances"
          erreur={erreur}
          onRetry={recharger}
        />
      )}

      {!chargement && !erreur && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              id="filtre-cours-seance"
              label="Filtrer par cours"
              value={coursFiltre}
              onChange={(event) => changerCours(event.target.value)}
            >
              <option value="">Tous les cours</option>
              {cours.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom_cours}
                </option>
              ))}
            </Select>
            <Select
              id="filtre-statut-seance"
              label="Filtrer par statut"
              value={statutFiltre}
              onChange={(event) => setStatutFiltre(event.target.value)}
            >
              <option value="">Tous les statuts</option>
              {Object.entries(STATUTS_SEANCE).map(([valeur, configuration]) => (
                <option key={valeur} value={valeur}>
                  {configuration.label}
                </option>
              ))}
            </Select>
          </div>

          <p className="text-sm text-slate-600" role="status">
            {seancesFiltrees.length} séance{seancesFiltrees.length > 1 ? 's' : ''} affichée
            {seancesFiltrees.length > 1 ? 's' : ''}
          </p>

          <DataTable
            titre="Liste des séances"
            colonnes={colonnes}
            lignes={seancesFiltrees}
            libelleRecherche="Rechercher une séance"
            placeholderRecherche="Cours, salle, date…"
            rechercheDans={['cours_nom', 'salle', 'date_seance']}
            parPage={10}
            vide={
              <EmptyState
                icon={CalendarDays}
                title={
                  coursFiltre || statutFiltre
                    ? 'Aucune séance pour ces filtres'
                    : 'Aucune séance planifiée'
                }
                description={
                  coursFiltre || statutFiltre
                    ? 'Modifiez le cours ou le statut sélectionné pour voir d’autres séances.'
                    : estGestionnaire
                      ? 'Créez une séance pour pouvoir projeter un QR code et enregistrer les présences.'
                      : 'Aucune séance n’est encore planifiée pour vos cours.'
                }
                action={
                  estGestionnaire ? (
                    <Button
                      variant="primary"
                      onClick={() =>
                        setEdition({ seance: null, coursInitial: coursFiltre || '' })
                      }
                    >
                      <CalendarPlus aria-hidden="true" className="h-5 w-5" />
                      Créer une séance
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
        title={edition?.seance ? 'Modifier la séance' : 'Nouvelle séance'}
        description={
          edition?.seance
            ? 'Seules les informations de planification sont modifiées ; les présences restent intactes.'
            : 'Choisissez un créneau libre : la salle et l’enseignant ne peuvent pas être déjà occupés.'
        }
      >
        {edition && (
          <SeanceForm
            key={edition.seance?.id ?? `nouvelle-${edition.coursInitial}`}
            seance={edition.seance}
            coursDisponibles={cours}
            coursInitial={edition.coursInitial}
            onFermer={() => setEdition(null)}
            onReussi={recharger}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(suppression)}
        titre="Supprimer cette séance ?"
        description={
          suppression
            ? `La séance « ${suppression.cours_nom} » du ${formatDate(suppression.date_seance)} et toutes ses présences seront définitivement supprimées.`
            : ''
        }
        libelleConfirmer="Supprimer la séance"
        onConfirmer={supprimer}
        onAnnuler={() => setSuppression(null)}
        chargement={suppressionEnCours}
      />

      {!estGestionnaire && seancesFiltrees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/scan')}>
            <QrCode aria-hidden="true" className="h-5 w-5" />
            Scanner un QR code
          </Button>
        </div>
      )}
    </Page>
  );
}

export default Seances;
