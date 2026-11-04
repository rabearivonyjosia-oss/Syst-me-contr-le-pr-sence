import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ClipboardCopy,
  Clock,
  Expand,
  MapPin,
  QrCode,
  RefreshCw,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Page from '../components/layout/Page.jsx';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  PageHeader,
  SkeletonCarte,
  StatutSeanceBadge,
} from '../components/ui/index.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useInterval, useRequete } from '../hooks/useRequete.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  codeDepuisErreur,
  messageDepuisErreur,
  seancesApi,
} from '../services/api.js';
import {
  formatDateLongue,
  formatHeure,
  formatPlage,
} from '../utils/format.js';

function QrSeance() {
  const { id } = useParams();
  const { succes, erreur: notifierErreur } = useToast();
  const [qr, setQr] = useState(null);
  const [echeance, setEcheance] = useState(0);
  const [restant, setRestant] = useState(0);
  const [auto, setAuto] = useState(true);
  const [chargementQr, setChargementQr] = useState(true);
  const [renouvellement, setRenouvellement] = useState(false);
  const [erreurQr, setErreurQr] = useState('');
  const [codeErreur, setCodeErreur] = useState('');
  const zoneQr = useRef(null);
  const initialise = useRef(false);
  const renouvellementEnCours = useRef(false);
  const autoRef = useRef(true);

  usePageTitle('QR code de la séance');

  useEffect(() => {
    autoRef.current = auto;
  }, [auto]);

  const charger = useCallback(async () => seancesApi.get(id), [id]);
  const { donnees, chargement, erreur, recharger, setDonnees } = useRequete(charger);
  const seance = donnees;

  const rafraichirSeance = useCallback(async () => {
    try {
      const miseAJour = await seancesApi.get(id);
      setDonnees(miseAJour);
    } catch {
      // Le compteur de présents est secondaire : une erreur ponctuelle ne doit
      // pas interrompre l'affichage du QR code déjà projeté.
    }
  }, [id, setDonnees]);

  useInterval(rafraichirSeance, 15000);

  const generer = useCallback(
    async ({ silencieux = false } = {}) => {
      if (renouvellementEnCours.current) return;
      renouvellementEnCours.current = true;
      setRenouvellement(true);
      if (!silencieux) setChargementQr(true);
      setErreurQr('');
      setCodeErreur('');
      try {
        const donneesQr = await seancesApi.renouvelerQr(id);
        setQr(donneesQr);
        // On se base sur la durée annoncée par le serveur plutôt que sur
        // l'horloge du poste, qui peut être légèrement décalée.
        setEcheance(Date.now() + (donneesQr.expires_in ?? 60) * 1000);
        setRestant(donneesQr.expires_in ?? 0);
        setErreurQr('');
      } catch (probleme) {
        setQr(null);
        setCodeErreur(codeDepuisErreur(probleme));
        setErreurQr(
          messageDepuisErreur(
            probleme,
            'Impossible de générer le QR code pour cette séance.',
          ),
        );
      } finally {
        renouvellementEnCours.current = false;
        setRenouvellement(false);
        setChargementQr(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (initialise.current) return;
    initialise.current = true;
    generer();
  }, [generer]);

  useEffect(() => {
    if (!qr || !echeance) return undefined;

    const tick = () => {
      const secondes = Math.max(0, Math.ceil((echeance - Date.now()) / 1000));
      setRestant(secondes);
      if (secondes <= 0 && autoRef.current) {
        generer({ silencieux: true });
      }
    };

    tick();
    const minuterie = window.setInterval(tick, 1000);
    return () => window.clearInterval(minuterie);
  }, [qr, echeance, generer]);

  const copierCode = async () => {
    if (!qr?.qr_payload) return;
    try {
      await navigator.clipboard.writeText(qr.qr_payload);
      succes('Code copié dans le presse-papiers.');
    } catch {
      notifierErreur(
        'Impossible de copier automatiquement. Sélectionnez le code affiché pour le copier.',
      );
    }
  };

  const passerPleinEcran = async () => {
    try {
      if (zoneQr.current?.requestFullscreen) {
        await zoneQr.current.requestFullscreen();
      }
    } catch {
      notifierErreur('Le mode plein écran n’est pas disponible sur ce navigateur.');
    }
  };

  if (chargement) {
    return (
      <Page>
        <SkeletonCarte className="h-32" />
        <SkeletonCarte className="h-96" />
      </Page>
    );
  }

  if (erreur || !seance) {
    return (
      <Page>
        <ErrorState
          titre="Impossible de charger la séance"
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

  const seancePassee = seance.statut === 'TERMINEE';

  return (
    <Page>
      <PageHeader
        titre="QR code de la séance"
        description={`${seance.cours_nom} · ${formatDateLongue(
          seance.date_seance,
        )} · ${formatPlage(seance.heure_debut, seance.heure_fin)}`}
        icone={QrCode}
        fil={[
          { label: 'Séances', to: '/seances' },
          { label: 'Détail', to: `/seances/${seance.id}` },
          { label: 'QR code' },
        ]}
        action={<StatutSeanceBadge statut={seance.statut} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Projetez ce code aux étudiants"
            description="Le code se renouvelle automatiquement environ toutes les 60 secondes."
            action={
              <Badge variant={qr ? 'success' : 'neutral'}>
                {qr ? 'Actif' : 'Inactif'}
              </Badge>
            }
          />
          <CardBody className="space-y-5">
            {chargementQr && !qr && (
              <div
                role="status"
                className="flex flex-col items-center justify-center gap-3 rounded-app border border-dashed border-slate-300 px-6 py-16 text-slate-600"
              >
                <RefreshCw aria-hidden="true" className="h-8 w-8 animate-spin text-brand-700" />
                <p className="font-medium">Génération du QR code…</p>
              </div>
            )}

            {!chargementQr && erreurQr && (
              <>
                <Alert
                  variant={
                    codeErreur === 'seance_non_ouverte' ? 'warning' : 'info'
                  }
                  title={
                    codeErreur === 'seance_non_ouverte'
                      ? 'Le QR code n’est pas encore disponible'
                      : 'QR code indisponible'
                  }
                >
                  <p>{erreurQr}</p>
                  <p className="mt-2 text-sm">
                    Le QR code peut être projeté de 10 minutes avant le début
                    jusqu’à la fin de la séance. L’émargement, lui, n’est accepté
                    qu’à partir de {formatHeure(seance.heure_debut)}.
                  </p>
                </Alert>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => generer()}
                    loading={renouvellement}
                  >
                    <RefreshCw aria-hidden="true" className="h-5 w-5" />
                    Réessayer
                  </Button>
                  <Link
                    to={`/seances/${seance.id}`}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-app px-3 font-semibold text-brand-700 no-underline hover:bg-brand-50"
                  >
                    <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                    Retour à la séance
                  </Link>
                </div>
              </>
            )}

            {qr && (
              <>
                {qr.emargement_ouvert === false && (
                  <Alert variant="info" title="Projection anticipée">
                    L’émargement ouvrira à {formatHeure(seance.heure_debut)}. Les
                    étudiants peuvent déjà voir le code, mais le scan sera refusé
                    avant l’heure de début.
                  </Alert>
                )}

                {seancePassee && (
                  <Alert variant="info" title="Séance terminée">
                    L’émargement est fermé. Les présences peuvent encore être
                    corrigées depuis la feuille de présence.
                  </Alert>
                )}

                <div
                  ref={zoneQr}
                  className="flex flex-col items-center gap-4 rounded-app border border-slate-200 bg-white p-5"
                >
                  <div
                    role="img"
                    aria-label={`QR code de la séance ${seance.cours_nom} du ${formatDateLongue(
                      seance.date_seance,
                    )}`}
                    className="rounded-app bg-white p-2"
                  >
                    <QRCodeSVG
                      value={qr.qr_payload}
                      size={280}
                      level="M"
                      marginSize={2}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                    />
                  </div>

                  <div className="w-full max-w-sm space-y-2 text-center">
                    <p
                      role="timer"
                      aria-live="off"
                      className={`text-2xl font-bold tabular-nums ${
                        restant <= 10 ? 'text-warning-800' : 'text-slate-900'
                      }`}
                    >
                      {restant > 0
                        ? `Expire dans ${restant} seconde${restant > 1 ? 's' : ''}`
                        : 'Code expiré'}
                    </p>
                    <div
                      aria-hidden="true"
                      className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                    >
                      <div
                        className={`h-full rounded-full transition-[width] duration-1000 ${
                          restant <= 10 ? 'bg-warning-700' : 'bg-brand-700'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, (restant / 60) * 100))}%`,
                        }}
                      />
                    </div>
                    {restant <= 10 && restant > 0 && (
                      <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-warning-800">
                        <TriangleAlert aria-hidden="true" className="h-4 w-4" />
                        Renouvellement imminent
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-app px-3 text-sm font-medium text-slate-800">
                      <input
                        type="checkbox"
                        checked={auto}
                        onChange={(event) => {
                          setAuto(event.target.checked);
                          if (event.target.checked && restant <= 0) generer();
                        }}
                        className="h-5 w-5 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                      />
                      Renouvellement automatique
                    </label>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => generer()}
                      loading={renouvellement}
                    >
                      <RefreshCw aria-hidden="true" className="h-4 w-4" />
                      Renouveler maintenant
                    </Button>
                    <Button variant="ghost" size="sm" onClick={passerPleinEcran}>
                      <Expand aria-hidden="true" className="h-4 w-4" />
                      Plein écran
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    Code de secours (saisie manuelle)
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="min-w-0 flex-1 break-all rounded-app border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                      {qr.qr_payload}
                    </code>
                    <Button variant="secondary" size="sm" onClick={copierCode}>
                      <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
                      Copier
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600">
                    En cas de problème de caméra, l’étudiant peut saisir ce code
                    depuis l’écran « Scanner ».
                  </p>
                </div>
              </>
            )}

            <div className="border-t border-slate-200 pt-3 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-success-700" />
                Un étudiant déjà présent obtient un message d’information, sans
                créer de doublon.
              </p>
            </div>
          </CardBody>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader title="Séance" />
            <CardBody className="space-y-3 text-sm">
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                <Clock aria-hidden="true" className="h-4 w-4 text-brand-700" />
                {formatDateLongue(seance.date_seance)}
              </p>
              <p className="text-slate-700">{formatPlage(seance.heure_debut, seance.heure_fin)}</p>
              <p className="flex items-center gap-2 text-slate-700">
                <MapPin aria-hidden="true" className="h-4 w-4 text-brand-700" />
                Salle {seance.salle || 'non renseignée'}
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <Users aria-hidden="true" className="h-4 w-4 text-brand-700" />
                {seance.nb_presents} présent(s) sur {seance.nb_etudiants}
              </p>
              <Button variant="secondary" size="sm" onClick={rafraichirSeance}>
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                Actualiser le compteur
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-2 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Consignes de projection</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Projetez le code en grand et laissez-le visible.</li>
                <li>Le renouvellement est automatique si l’onglet reste ouvert.</li>
                <li>Fermez la page à la fin de la séance.</li>
              </ul>
              <Link
                to={`/seances/${seance.id}/presences`}
                className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-brand-700"
              >
                Voir la feuille de présence
              </Link>
            </CardBody>
          </Card>

          <Link
            to={`/seances/${seance.id}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-app px-3 font-semibold text-brand-700 no-underline hover:bg-brand-50"
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            Retour à la séance
          </Link>
        </aside>
      </div>

    </Page>
  );
}

export default QrSeance;
