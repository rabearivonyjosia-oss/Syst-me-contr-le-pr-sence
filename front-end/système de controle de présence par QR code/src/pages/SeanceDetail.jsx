import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Clock,
  Mail,
  MapPin,
  Pencil,
  QrCode,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import SeanceForm from '../components/forms/SeanceForm.jsx';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  ErrorState,
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
  coursApi,
  messageDepuisErreur,
  seancesApi,
} from '../services/api.js';
import { TYPES_SEANCE } from '../utils/constants.js';
import {
  formatDateHeure,
  formatDateLongue,
  formatHeure,
  formatPlage,
} from '../utils/format.js';

function LigneInfo({ icone: Icone, libelle, valeur }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app bg-brand-50 text-brand-700"
      >
        <Icone className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <dt className="text-sm font-semibold text-slate-600">{libelle}</dt>
        <dd className="text-base font-medium text-slate-900">{valeur}</dd>
      </div>
    </div>
  );
}

function SeanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estGestionnaire, estEtudiant } = useAuth();
  const { succes, erreur: notifierErreur } = useToast();
  const [edition, setEdition] = useState(false);
  const [suppression, setSuppression] = useState(false);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  usePageTitle('Détail de la séance');

  const charger = useCallback(async () => {
    const [details, cours] = await Promise.all([
      seancesApi.get(id),
      estGestionnaire ? coursApi.list({ page_size: 100 }) : Promise.resolve({ results: [] }),
    ]);
    return { seance: details, cours: cours.results ?? [] };
  }, [id, estGestionnaire]);

  const { donnees, chargement, erreur, recharger } = useRequete(charger);
  const seance = donnees?.seance;
  const cours = donnees?.cours ?? [];

  const supprimer = async () => {
    setSuppressionEnCours(true);
    try {
      await seancesApi.remove(id);
      succes('La séance a été supprimée.');
      navigate('/seances', { replace: true });
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

  if (chargement) {
    return (
      <Page>
        <SkeletonCarte className="h-36" />
        <SkeletonCarte className="h-64" />
      </Page>
    );
  }

  if (erreur) {
    return (
      <Page>
        <ErrorState
          titre="Impossible de charger cette séance"
          erreur={erreur}
          onRetry={recharger}
        />
        <div>
          <Button variant="secondary" onClick={() => navigate('/seances')}>
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            Retour aux séances
          </Button>
        </div>
      </Page>
    );
  }

  if (!seance) return null;

  const typeLibelle =
    seance.type_seance_libelle ||
    TYPES_SEANCE.find((type) => type.value === seance.type_seance)?.label ||
    seance.type_seance;
  const presence = seance.ma_presence;

  return (
    <Page>
      <PageHeader
        titre={seance.cours_nom}
        description={`Séance du ${formatDateLongue(seance.date_seance)} · ${formatPlage(
          seance.heure_debut,
          seance.heure_fin,
        )}`}
        icone={CalendarDays}
        fil={[
          { label: 'Séances', to: '/seances' },
          { label: `${seance.cours_nom} du ${formatDateLongue(seance.date_seance)}` },
        ]}
        action={<StatutSeanceBadge statut={seance.statut} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Informations de la séance"
            description="Vérifiez le cours, le créneau et la salle avant l’émargement."
          />
          <CardBody>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LigneInfo
                icone={CalendarDays}
                libelle="Date"
                valeur={formatDateLongue(seance.date_seance)}
              />
              <LigneInfo
                icone={Clock}
                libelle="Horaire"
                valeur={formatPlage(seance.heure_debut, seance.heure_fin)}
              />
              <LigneInfo icone={MapPin} libelle="Salle" valeur={seance.salle || 'Non renseignée'} />
              <LigneInfo icone={ClipboardList} libelle="Type" valeur={typeLibelle} />
              <LigneInfo
                icone={UserRound}
                libelle="Enseignant"
                valeur={seance.enseignant_nom || 'Non renseigné'}
              />
              <LigneInfo
                icone={Users}
                libelle={estGestionnaire ? 'Présents' : 'Cours'}
                valeur={
                  estGestionnaire
                    ? `${seance.nb_presents} présent(s) sur ${seance.nb_etudiants} inscrit(s)`
                    : seance.cours_nom
                }
              />
            </dl>
          </CardBody>
        </Card>

        <div className="space-y-4">
          {estGestionnaire && (
            <Card>
              <CardHeader
                title="Émargement"
                description="Le QR code est renouvelable toutes les 60 secondes."
              />
              <CardBody className="space-y-2">
                <Link
                  to={`/seances/${seance.id}/qr`}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-app bg-brand-700 px-4 text-base font-semibold text-white no-underline transition-colors hover:bg-brand-800"
                >
                  <QrCode aria-hidden="true" className="h-5 w-5" />
                  Afficher le QR code
                </Link>
                <Link
                  to={`/seances/${seance.id}/presences`}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-app border border-slate-300 bg-white px-4 text-base font-semibold text-slate-800 no-underline transition-colors hover:bg-slate-50"
                >
                  <ClipboardList aria-hidden="true" className="h-5 w-5" />
                  Feuille de présence
                </Link>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setEdition(true)}
                >
                  <Pencil aria-hidden="true" className="h-5 w-5" />
                  Modifier la séance
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-danger-700 hover:bg-danger-50"
                  onClick={() => setSuppression(true)}
                >
                  <Trash2 aria-hidden="true" className="h-5 w-5" />
                  Supprimer la séance
                </Button>
              </CardBody>
            </Card>
          )}

          {estEtudiant && (
            <Card>
              <CardHeader
                title="Votre présence"
                description="Le statut est mis à jour dès le scan du QR code."
              />
              <CardBody className="space-y-3">
                {presence ? (
                  <>
                    <StatutPresenceBadge statut={presence.statut} />
                    <p className="text-sm text-slate-600">
                      Pointé le {formatDateHeure(presence.timestamp)}
                      {presence.motif_justification
                        ? ` · Motif : ${presence.motif_justification}`
                        : ''}
                    </p>
                  </>
                ) : seance.statut === 'EN_COURS' ? (
                  <p className="text-sm text-slate-700">
                    Vous n’avez pas encore pointé. Scannez le QR code affiché par
                    l’enseignant pendant la séance.
                  </p>
                ) : seance.statut === 'A_VENIR' ? (
                  <p className="text-sm text-slate-700">
                    La séance n’a pas encore commencé. Le scan sera accepté à partir de{' '}
                    {formatHeure(seance.heure_debut)}.
                  </p>
                ) : (
                  <p className="text-sm text-slate-700">
                    La séance est terminée et aucune présence n’a été enregistrée.
                    Demandez à votre enseignant une correction si nécessaire.
                  </p>
                )}

                {seance.statut === 'EN_COURS' && (
                  <Link
                    to="/scan"
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-app bg-brand-700 px-4 text-base font-semibold text-white no-underline transition-colors hover:bg-brand-800"
                  >
                    <QrCode aria-hidden="true" className="h-5 w-5" />
                    Scanner le QR code
                  </Link>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardBody className="space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2 font-semibold text-slate-800">
                <Mail aria-hidden="true" className="h-4 w-4 text-brand-700" />
                Besoin d’aide ?
              </p>
              <p>
                Consultez la page{' '}
                <Link to="/aide" className="font-semibold text-brand-700">
                  Aide
                </Link>{' '}
                pour connaître les règles d’émargement et les délais du QR code.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={edition}
        onClose={() => setEdition(false)}
        title="Modifier la séance"
        description="Les présences déjà enregistrées sont conservées."
      >
        {edition && (
          <SeanceForm
            key={seance.id}
            seance={{
              ...seance,
              type_seance_libelle: typeLibelle,
            }}
            coursDisponibles={cours}
            onFermer={() => setEdition(false)}
            onReussi={recharger}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={suppression}
        titre="Supprimer cette séance ?"
        description={`La séance du ${formatDateLongue(
          seance.date_seance,
        )} et toutes ses présences seront définitivement supprimées.`}
        libelleConfirmer="Supprimer la séance"
        onConfirmer={supprimer}
        onAnnuler={() => setSuppression(false)}
        chargement={suppressionEnCours}
      />
    </Page>
  );
}

export default SeanceDetail;
