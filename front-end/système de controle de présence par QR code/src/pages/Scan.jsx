import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Info,
  Keyboard,
  QrCode,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import Page from '../components/layout/Page.jsx';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  PageHeader,
} from '../components/ui/index.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import {
  codeDepuisErreur,
  messageDepuisErreur,
  presencesApi,
} from '../services/api.js';
import { formatDateLongue, formatPlage } from '../utils/format.js';

const ID_LECTEUR = 'lecteur-qr-presence';

const TITRES_ERREUR = {
  qr_invalide: 'QR code invalide',
  qr_expire: 'QR code expiré',
  seance_non_ouverte: 'Séance pas encore ouverte',
  seance_terminee: 'Séance terminée',
  non_inscrit: 'Vous n’êtes pas inscrit à ce cours',
  etudiant_non_inscrit: 'Étudiant non inscrit',
  validation: 'Code incomplet',
};

function messageCamera(probleme) {
  const nom = probleme?.name || '';
  if (nom === 'NotAllowedError' || nom === 'PermissionDeniedError') {
    return 'L’accès à la caméra a été refusé. Autorisez la caméra dans les réglages du navigateur, puis réessayez. Vous pouvez aussi saisir le code manuellement.';
  }
  if (nom === 'NotFoundError' || nom === 'DevicesNotFoundError') {
    return 'Aucune caméra n’a été détectée sur cet appareil. Utilisez la saisie manuelle du code.';
  }
  if (nom === 'NotReadableError' || nom === 'TrackStartError') {
    return 'La caméra est déjà utilisée par une autre application. Fermez-la puis réessayez, ou saisissez le code manuellement.';
  }
  if (nom === 'OverconstrainedError') {
    return 'La caméra arrière n’est pas disponible sur cet appareil. Utilisez la saisie manuelle du code.';
  }
  return 'Impossible de démarrer la caméra. Vérifiez les autorisations du navigateur ou utilisez la saisie manuelle.';
}

function Scan() {
  const cameraDisponible =
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const [mode, setMode] = useState(() => (cameraDisponible ? 'camera' : 'manuel'));
  const [cameraActive, setCameraActive] = useState(false);
  const [demarrageCamera, setDemarrageCamera] = useState(false);
  const [erreurCamera, setErreurCamera] = useState('');
  const [codeManuel, setCodeManuel] = useState('');
  const [erreurCode, setErreurCode] = useState('');
  const [resultat, setResultat] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const scannerRef = useRef(null);
  const envoiEnCours = useRef(false);

  usePageTitle('Scanner une présence');

  const arreterCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) {
      setCameraActive(false);
      return;
    }
    try {
      await scanner.stop();
    } catch {
      // La caméra peut déjà être arrêtée (changement d'onglet, erreur système).
    }
    try {
      scanner.clear();
    } catch {
      // Le conteneur a pu être démonté : rien d'autre à nettoyer.
    }
    setCameraActive(false);
  }, []);

  const soumettreCode = useCallback(async (valeur) => {
    const code = String(valeur || '').trim();
    if (!code) {
      setErreurCode('Saisissez ou scannez le code de la séance.');
      return;
    }
    if (envoiEnCours.current) return;

    envoiEnCours.current = true;
    setEnvoi(true);
    setErreurCode('');
    setResultat(null);
    try {
      const donnees = await presencesApi.scan(code);
      setResultat({
        type: 'succes',
        titre: 'Présence enregistrée',
        message: donnees.detail,
        seance: donnees.seance,
      });
      setCodeManuel('');
    } catch (probleme) {
      const codeErreur = codeDepuisErreur(probleme);
      const message = messageDepuisErreur(
        probleme,
        'Le scan n’a pas abouti. Vérifiez le code et réessayez.',
      );
      if (codeErreur === 'deja_present') {
        setResultat({
          type: 'information',
          titre: 'Présence déjà enregistrée',
          message,
        });
      } else {
        setResultat({
          type: 'erreur',
          titre: TITRES_ERREUR[codeErreur] || 'Scan impossible',
          message,
        });
      }
    } finally {
      envoiEnCours.current = false;
      setEnvoi(false);
    }
  }, []);

  const traiterScan = useCallback(
    (texte) => {
      if (envoiEnCours.current) return;
      arreterCamera();
      soumettreCode(texte);
    },
    [arreterCamera, soumettreCode],
  );

  const demarrerCamera = useCallback(async () => {
    if (!window.isSecureContext) {
      setErreurCamera(
        'La caméra n’est accessible qu’en HTTPS ou sur localhost. Utilisez la saisie manuelle du code.',
      );
      setMode('manuel');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setErreurCamera(
        'Ce navigateur ne prend pas en charge l’accès à la caméra. Utilisez la saisie manuelle du code.',
      );
      setMode('manuel');
      return;
    }

    setErreurCamera('');
    setDemarrageCamera(true);
    try {
      const scanner = new Html5Qrcode(ID_LECTEUR, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (texte) => traiterScan(texte),
        () => {
          // Les images sans QR code sont ignorées : aucune erreur à afficher.
        },
      );
      setCameraActive(true);
    } catch (probleme) {
      setErreurCamera(messageCamera(probleme));
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        try {
          scanner.clear();
        } catch {
          // Le lecteur n'a jamais démarré : aucun conteneur à vider.
        }
      }
      setCameraActive(false);
    } finally {
      setDemarrageCamera(false);
    }
  }, [traiterScan]);

  useEffect(() => {
    if (mode !== 'camera') arreterCamera();
  }, [mode, arreterCamera]);

  useEffect(
    () => () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        scanner
          .stop()
          .catch(() => {
            // Lecteur déjà arrêté au moment du démontage.
          })
          .finally(() => {
            try {
              scanner.clear();
            } catch {
              // Conteneur démonté : rien à nettoyer.
            }
          });
      }
    },
    [],
  );

  const soumettreManuel = (event) => {
    event.preventDefault();
    soumettreCode(codeManuel);
  };

  const recommencer = () => {
    setResultat(null);
    setCodeManuel('');
    setErreurCode('');
    if (mode === 'camera' && !cameraActive && !erreurCamera) {
      demarrerCamera();
    }
  };

  return (
    <Page>
      <PageHeader
        titre="Scanner une présence"
        description="Scannez le QR code affiché par l’enseignant pendant la séance. La saisie manuelle du code est toujours disponible."
        icone={QrCode}
        action={
          resultat?.type === 'succes' && resultat.seance ? (
            <Link
              to={`/seances/${resultat.seance.id}`}
              className="inline-flex min-h-[44px] items-center rounded-app border border-slate-300 bg-white px-4 text-base font-semibold text-slate-800 no-underline hover:bg-slate-50"
            >
              Voir la séance
            </Link>
          ) : undefined
        }
      />

      {resultat && (
        <div className="space-y-3">
          <Alert
            variant={
              resultat.type === 'succes'
                ? 'success'
                : resultat.type === 'information'
                  ? 'info'
                  : 'danger'
            }
            title={resultat.titre}
          >
            <p>{resultat.message}</p>
          </Alert>

          {resultat.type === 'succes' && resultat.seance && (
            <Card>
              <CardBody className="space-y-1 text-sm">
                <p className="flex items-center gap-2 font-semibold text-slate-900">
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-success-700" />
                  {resultat.seance.cours_nom}
                </p>
                <p className="text-slate-700">
                  {formatDateLongue(resultat.seance.date_seance)} ·{' '}
                  {formatPlage(resultat.seance.heure_debut, resultat.seance.heure_fin)}
                </p>
                <p className="text-slate-700">Salle {resultat.seance.salle || 'non renseignée'}</p>
              </CardBody>
            </Card>
          )}

          {resultat.type === 'information' && (
            <p className="flex items-start gap-2 rounded-app bg-brand-50 px-4 py-3 text-sm text-brand-900">
              <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              Votre présence était déjà enregistrée : aucun doublon n’a été créé.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={recommencer}>
              <RotateCcw aria-hidden="true" className="h-5 w-5" />
              Scanner à nouveau
            </Button>
            {resultat.type === 'erreur' && mode === 'manuel' && (
              <Button
                variant="secondary"
                onClick={() => {
                  setResultat(null);
                  setMode('camera');
                }}
              >
                <Camera aria-hidden="true" className="h-5 w-5" />
                Essayer avec la caméra
              </Button>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardHeader
          title="Moyen de saisie"
          description="La caméra est plus rapide ; la saisie manuelle reste le repli garanti."
        />
        <CardBody className="space-y-4">
          <div
            role="group"
            aria-label="Choisir le moyen de saisie"
            className="flex flex-wrap gap-2"
          >
            <button
              type="button"
              onClick={() => setMode('camera')}
              aria-pressed={mode === 'camera'}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-app border px-4 text-base font-semibold transition-colors ${
                mode === 'camera'
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Camera aria-hidden="true" className="h-5 w-5" />
              Caméra
            </button>
            <button
              type="button"
              onClick={() => setMode('manuel')}
              aria-pressed={mode === 'manuel'}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-app border px-4 text-base font-semibold transition-colors ${
                mode === 'manuel'
                  ? 'border-brand-700 bg-brand-700 text-white'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Keyboard aria-hidden="true" className="h-5 w-5" />
              Saisie manuelle
            </button>
          </div>

          {mode === 'camera' && (
            <div className="space-y-3">
              {!window.isSecureContext && (
                <Alert variant="warning" title="Caméra indisponible sur ce navigateur">
                  L’accès à la caméra exige une connexion sécurisée (HTTPS) ou
                  l’adresse localhost. Utilisez la saisie manuelle du code.
                </Alert>
              )}

              {erreurCamera && (
                <Alert
                  variant="warning"
                  title="Caméra indisponible"
                  className="items-start"
                >
                  <p>{erreurCamera}</p>
                  <div className="mt-3">
                    <Button variant="secondary" size="sm" onClick={() => setMode('manuel')}>
                      <Keyboard aria-hidden="true" className="h-4 w-4" />
                      Saisir le code manuellement
                    </Button>
                  </div>
                </Alert>
              )}

              <div className="relative overflow-hidden rounded-app border border-slate-300 bg-slate-900">
                <div
                  id={ID_LECTEUR}
                  className="mx-auto aspect-square w-full max-w-md [&_video]:object-cover"
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center text-white">
                    {demarrageCamera ? (
                      <>
                        <Camera aria-hidden="true" className="h-10 w-10 animate-pulse" />
                        <p className="font-medium">Démarrage de la caméra…</p>
                      </>
                    ) : (
                      <>
                        <CameraOff aria-hidden="true" className="h-10 w-10 text-slate-300" />
                        <p className="max-w-xs text-sm text-slate-200">
                          Autorisez l’accès à la caméra pour scanner le QR code affiché
                          en salle.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {!cameraActive ? (
                  <Button
                    variant="primary"
                    onClick={demarrerCamera}
                    loading={demarrageCamera}
                    disabled={!window.isSecureContext}
                  >
                    <Camera aria-hidden="true" className="h-5 w-5" />
                    Activer la caméra
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={arreterCamera}>
                    <CameraOff aria-hidden="true" className="h-5 w-5" />
                    Arrêter la caméra
                  </Button>
                )}
              </div>

              <p className="flex items-start gap-2 text-sm text-slate-600">
                <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                Les images de la caméra ne sont traitées que dans votre navigateur et
                ne sont jamais enregistrées.
              </p>
            </div>
          )}

          {mode === 'manuel' && (
            <form onSubmit={soumettreManuel} className="space-y-3" noValidate>
              <Input
                id="code-seance"
                label="Code de la séance"
                value={codeManuel}
                onChange={(event) => setCodeManuel(event.target.value)}
                error={erreurCode}
                hint="Collez le code complet (PQR:…) ou le jeton affiché sous le QR code."
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={envoi}
                leadingIcon={QrCode}
              />
              <Button type="submit" variant="primary" loading={envoi}>
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                Valider le code
              </Button>
            </form>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Bon à savoir" />
        <CardBody>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Le QR code change régulièrement : scannez celui affiché à l’écran.</li>
            <li>Le scan n’est accepté que pendant la séance, pas avant ni après.</li>
            <li>Un second scan renvoie une information, sans créer de doublon.</li>
            <li>
              En cas de difficulté, demandez à votre enseignant de corriger votre
              présence depuis la feuille de présence.
            </li>
          </ul>
        </CardBody>
      </Card>
    </Page>
  );
}

export default Scan;
