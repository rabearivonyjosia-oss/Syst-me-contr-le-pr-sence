import { useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Clock,
  MapPin,
  Pencil,
  QrCode,
  UserRound,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  PageHeader,
  Select,
  SkeletonCarte,
  StatCard,
  StatutPresenceBadge,
  StatutSeanceBadge,
} from '../components/ui/index.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useRequete } from '../hooks/useRequete.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  champsDepuisErreur,
  messageDepuisErreur,
  seancesApi,
} from '../services/api.js';
import { STATUTS_PRESENCE } from '../utils/constants.js';
import {
  formatDateHeure,
  formatDateLongue,
  formatPlage,
  formatPourcentage,
} from '../utils/format.js';

/** Formulaire de correction d'une ligne de présence. */
function FormulaireCorrection({ ligne, seanceId, onFermer, onReussi }) {
  const { succes } = useToast();
  const [statut, setStatut] = useState(ligne.statut);
  const [motif, setMotif] = useState(ligne.motif_justification || '');
  const [erreurs, setErreurs] = useState({});
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (event) => {
    event.preventDefault();
    setErreur('');
    setErreurs({});
    setEnvoi(true);
    try {
      await seancesApi.corrigerPresence(seanceId, {
        etudiant: ligne.etudiant,
        statut,
        motif_justification: statut === 'JUSTIFIE' ? motif.trim() : '',
      });
      succes(
        `La présence de ${ligne.nom_complet || ligne.username} a été mise à jour.`,
      );
      onReussi();
      onFermer();
    } catch (probleme) {
      setErreurs(champsDepuisErreur(probleme));
      setErreur(
        messageDepuisErreur(
          probleme,
          'Impossible de corriger cette présence. Réessayez dans un instant.',
        ),
      );
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <form onSubmit={soumettre} className="space-y-4" noValidate>
      <div className="rounded-app bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">
          {ligne.nom_complet || ligne.username}
        </p>
        <p>
          {ligne.email}
          {ligne.num_matricule ? ` · Matricule ${ligne.num_matricule}` : ''}
        </p>
      </div>

      {erreur && (
        <p
          role="alert"
          className="rounded-app bg-danger-50 px-3 py-2 text-sm font-medium text-danger-800"
        >
          {erreur}
        </p>
      )}

      <Select
        id="correction-statut"
        label="Statut de présence"
        required
        value={statut}
        onChange={(event) => setStatut(event.target.value)}
        error={erreurs.statut}
        disabled={envoi}
      >
        {Object.entries(STATUTS_PRESENCE).map(([valeur, configuration]) => (
          <option key={valeur} value={valeur}>
            {configuration.label}
          </option>
        ))}
      </Select>

      {statut === 'JUSTIFIE' && (
        <Input
          id="correction-motif"
          label="Motif de la justification"
          value={motif}
          onChange={(event) => setMotif(event.target.value)}
          error={erreurs.motif_justification}
          hint="Ce motif apparaît dans la feuille de présence et dans l’export CSV."
          maxLength={255}
          disabled={envoi}
        />
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
        <Button variant="secondary" onClick={onFermer} disabled={envoi}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={envoi}>
          Enregistrer le statut
        </Button>
      </div>
    </form>
  );
}

function PresencesSeance() {
  const { id } = useParams();
  const [filtreStatut, setFiltreStatut] = useState('');
  const [correction, setCorrection] = useState(null);

  usePageTitle('Feuille de présence');

  const charger = useCallback(() => seancesApi.presences(id), [id]);
  const { donnees, chargement, erreur, recharger } = useRequete(charger);

  const seance = donnees?.seance;
  const resume = donnees?.resume;
  const etudiants = useMemo(() => donnees?.etudiants ?? [], [donnees]);

  const lignesFiltrees = useMemo(
    () =>
      filtreStatut
        ? etudiants.filter((ligne) => ligne.statut === filtreStatut)
        : etudiants,
    [etudiants, filtreStatut],
  );

  const colonnes = useMemo(
    () => [
      {
        cle: 'nom_complet',
        entete: 'Étudiant',
        rendu: (ligne) => (
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">
              {ligne.nom_complet || ligne.username}
            </p>
            <p className="text-sm text-slate-600">{ligne.email}</p>
          </div>
        ),
      },
      {
        cle: 'num_matricule',
        entete: 'Matricule',
        rendu: (ligne) => ligne.num_matricule || '—',
      },
      {
        cle: 'niveau_libelle',
        entete: 'Niveau',
        rendu: (ligne) => ligne.niveau_libelle || ligne.niveau || '—',
        masquerMobile: true,
      },
      {
        cle: 'statut',
        entete: 'Statut',
        rendu: (ligne) => <StatutPresenceBadge statut={ligne.statut} />,
      },
      {
        cle: 'source',
        entete: 'Source',
        rendu: (ligne) => ligne.source || '—',
        masquerMobile: true,
      },
      {
        cle: 'timestamp',
        entete: 'Pointé le',
        rendu: (ligne) => (ligne.timestamp ? formatDateHeure(ligne.timestamp) : '—'),
        masquerMobile: true,
      },
      {
        cle: 'motif_justification',
        entete: 'Motif',
        rendu: (ligne) => ligne.motif_justification || '—',
        masquerMobile: true,
      },
      {
        cle: 'actions',
        entete: 'Actions',
        triable: false,
        rendu: (ligne) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCorrection(ligne)}
            aria-label={`Corriger la présence de ${ligne.nom_complet || ligne.username}`}
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Corriger
          </Button>
        ),
      },
    ],
    [],
  );

  if (chargement) {
    return (
      <Page>
        <SkeletonCarte className="h-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCarte key={index} />
          ))}
        </div>
        <SkeletonCarte className="h-64" />
      </Page>
    );
  }

  if (erreur || !donnees) {
    return (
      <Page>
        <ErrorState
          titre="Impossible de charger la feuille de présence"
          erreur={erreur}
          onRetry={recharger}
        />
        <div>
          <Link
            to="/seances"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-app px-3 font-semibold text-brand-700 no-underline hover:bg-brand-50"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            Retour aux séances
          </Link>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        titre="Feuille de présence"
        description={`${seance.cours_nom} · ${formatDateLongue(
          seance.date_seance,
        )} · ${formatPlage(seance.heure_debut, seance.heure_fin)}`}
        icone={ClipboardList}
        fil={[
          { label: 'Séances', to: '/seances' },
          { label: 'Détail', to: `/seances/${seance.id}` },
          { label: 'Feuille de présence' },
        ]}
        action={<StatutSeanceBadge statut={seance.statut} />}
      />

      <Card>
        <CardBody className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <p className="flex items-center gap-2 text-slate-700">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-brand-700" />
            {formatDateLongue(seance.date_seance)}
          </p>
          <p className="flex items-center gap-2 text-slate-700">
            <Clock aria-hidden="true" className="h-4 w-4 text-brand-700" />
            {formatPlage(seance.heure_debut, seance.heure_fin)}
          </p>
          <p className="flex items-center gap-2 text-slate-700">
            <MapPin aria-hidden="true" className="h-4 w-4 text-brand-700" />
            Salle {seance.salle || 'non renseignée'}
          </p>
        </CardBody>
      </Card>

      {resume && (
        <section aria-labelledby="resume-presences-titre" className="space-y-3">
          <h2 id="resume-presences-titre" className="sr-only">
            Résumé des présences
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              titre="Présents"
              valeur={resume.presents}
              icone={UserRound}
              description={`sur ${resume.total} étudiant(s)`}
              variant="success"
            />
            <StatCard
              titre="Absents"
              valeur={resume.absents}
              icone={UserRound}
              description="Non pointés ou marqués absents"
              variant="danger"
            />
            <StatCard
              titre="Justifiés"
              valeur={resume.justifies}
              icone={UserRound}
              description="Absences avec motif"
              variant="warning"
            />
            <StatCard
              titre="Taux de présence"
              valeur={formatPourcentage(resume.taux_presence)}
              icone={ClipboardList}
              description="Présents / étudiants inscrits"
            />
          </div>
        </section>
      )}

      <Card>
        <CardHeader
          title="Étudiants du cours"
          description="Le statut peut être corrigé à tout moment, même après la séance."
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/seances/${seance.id}/qr`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-app border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
              >
                <QrCode aria-hidden="true" className="h-4 w-4" />
                QR code
              </Link>
              <Link
                to={`/seances/${seance.id}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-app px-3 text-sm font-semibold text-brand-700 no-underline hover:bg-brand-50"
              >
                Détail de la séance
              </Link>
            </div>
          }
        />
        <CardBody className="space-y-4">
          <Select
            id="filtre-statut-presence"
            label="Filtrer par statut"
            value={filtreStatut}
            onChange={(event) => setFiltreStatut(event.target.value)}
            className="w-full sm:max-w-xs"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUTS_PRESENCE).map(([valeur, configuration]) => (
              <option key={valeur} value={valeur}>
                {configuration.label}
              </option>
            ))}
          </Select>

          {etudiants.length === 0 ? (
            <EmptyState
              icon={UserRound}
              title="Aucun étudiant inscrit"
              description="Inscrivez des étudiants au cours pour pouvoir suivre leurs présences."
              action={
                <Link
                  to={`/cours/${seance.cours}`}
                  className="inline-flex min-h-[44px] items-center rounded-app bg-brand-700 px-4 font-semibold text-white no-underline hover:bg-brand-800"
                >
                  Gérer les inscriptions
                </Link>
              }
            />
          ) : (
            <DataTable
              titre="Feuille de présence des étudiants"
              colonnes={colonnes}
              lignes={lignesFiltrees}
              libelleRecherche="Rechercher un étudiant"
              placeholderRecherche="Nom, email, matricule…"
              rechercheDans={['nom_complet', 'username', 'email', 'num_matricule']}
              parPage={15}
              vide={
                <EmptyState
                  icon={UserRound}
                  title="Aucun étudiant pour ce filtre"
                  description="Modifiez le statut sélectionné pour afficher d’autres étudiants."
                  action={
                    <Button variant="secondary" onClick={() => setFiltreStatut('')}>
                      Afficher tous les statuts
                    </Button>
                  }
                />
              }
            />
          )}

          <p className="text-sm text-slate-600">
            Une correction manuelle remplace le statut précédent et conserve une
            trace de la modification.
          </p>
        </CardBody>
      </Card>

      <Modal
        open={Boolean(correction)}
        onClose={() => setCorrection(null)}
        title="Corriger une présence"
        description="Choisissez le statut exact à enregistrer pour cet étudiant."
      >
        {correction && (
          <FormulaireCorrection
            key={`${correction.etudiant}-${correction.statut}`}
            ligne={correction}
            seanceId={seance.id}
            onFermer={() => setCorrection(null)}
            onReussi={recharger}
          />
        )}
      </Modal>
    </Page>
  );
}

export default PresencesSeance;
