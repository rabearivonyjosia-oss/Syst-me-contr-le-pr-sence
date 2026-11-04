import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  Keyboard,
  Loader2,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import AppLayout from '../components/layout/AppLayout.jsx';
import { Alert, Button, Card, Input } from '../components/ui/index.js';
import apiClient, { messageDepuisErreur } from '../services/api.js';

/*
 * Page « Scanner une présence » (Phase 3 — écran pilote).
 * Règles IHM : mobile-first, boutons ≥ 44×44 px, une seule action principale
 * visible à la fois, retour immédiat et explicite (vert + icône + texte, ou
 * cause précise en rouge), thème clair, texte sombre sur fond clair.
 * Backend inchangé : l'endpoint cible est POST /presences/scan/ avec { token } ;
 * tant qu'il ne répond pas, les erreurs serveur sont relayées telles quelles.
 * Caméra : html5-qrcode (getUserMedia). En HTTP non-localhost la caméra est
 * bloquée par le navigateur — d'où la saisie manuelle systématique de repli.
 */

const TYPES_ERREUR = {
  invalide: 'QR invalide : ce code ne correspond à aucune séance.',
  expire: 'QR expiré : le code n’est plus valable. Demandez à l’enseignant d’en générer un nouveau.',
  nonInscrit: 'Vous n’êtes pas inscrit à ce cours.',
  dejaEnregistre: 'Présence déjà enregistrée pour cette séance.',
  nonCommencee: 'La séance n’a pas encore commencé.',
  terminee: 'La séance est terminée.',
};

function ScanPage() {
  const lecteurRef = useRef(null);
  const scannerRef = useRef(null);
  const actifRef = useRef(false);

  const [cameraEnCours, setCameraEnCours] = useState(false);
  const [erreurCamera, setErreurCamera] = useState('');
  const [codeManuel, setCodeManuel] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState('');
  const [erreur, setErreur] = useState('');
  const [dernierCode, setDernierCode] = useState('');

  const arreterCamera = useCallback(async () => {
    const lecteur = scannerRef.current;
    if (!lecteur || !actifRef.current) return;
    try {
      const etat = lecteur.getState?.();
      // Html5QrcodeState.SCANNING = 2, PAUSED = 3
      if (etat === 2 || etat === 3) await lecteur.stop();
      lecteur.clear?.();
    } catch {
      // Déjà arrêté ou non démarré : on nettoie simplement.
      try { lecteur.clear?.(); } catch { /* ignore */ }
    } finally {
      actifRef.current = false;
      scannerRef.current = null;
      setCameraEnCours(false);
    }
  }, []);

  useEffect(() => () => {
    arreterCamera();
  }, [arreterCamera]);

  const classerErreur = (message) => {
    const m = String(message || '').toLowerCase();
    if (m.includes('expir')) return TYPES_ERREUR.expire;
    if (m.includes('invalide') || m.includes('invalid') || m.includes('introuvable')) return TYPES_ERREUR.invalide;
    if (m.includes('inscrit') || m.includes('not enrolled')) return TYPES_ERREUR.nonInscrit;
    if (m.includes('déjà') || m.includes('deja') || m.includes('already')) return TYPES_ERREUR.dejaEnregistre;
    if (m.includes('commenc')) return TYPES_ERREUR.nonCommencee;
    if (m.includes('termin') || m.includes('ended') || m.includes('closed')) return TYPES_ERREUR.terminee;
    return message || TYPES_ERREUR.invalide;
  };

  const envoyerPresence = useCallback(async (token) => {
    const valeur = String(token || '').trim();
    setSucces('');
    setErreur('');
    if (!valeur) {
      setErreur('Saisissez ou scannez le code QR de la séance pour enregistrer votre présence.');
      return;
    }
    setEnvoi(true);
    setDernierCode(valeur);
    try {
      // Endpoint cible (backend Phase 1) : POST /presences/scan/ { token }.
      // Repli : mêmes validations côté UI, relais du message serveur tel quel.
      await apiClient.post('/presences/scan/', { token: valeur });
      await arreterCamera();
      setCodeManuel('');
      setSucces('Présence enregistrée avec succès. Merci d’être à l’heure !');
    } catch (err) {
      const brut = messageDepuisErreur(err, 'Échec du marquage de présence.');
      setErreur(classerErreur(brut));
    } finally {
      setEnvoi(false);
    }
  }, [arreterCamera]);

  const demarrerCamera = useCallback(async () => {
    setErreurCamera('');
    setSucces('');
    setErreur('');
    if (!lecteurRef.current) {
      setErreurCamera('Le lecteur caméra n’est pas prêt. Utilisez la saisie manuelle ci-dessous.');
      return;
    }
    try {
      const lecteur = new Html5Qrcode(lecteurRef.current.id);
      scannerRef.current = lecteur;
      setCameraEnCours(true);
      await lecteur.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        async (texteLu) => {
          if (actifRef.current) return;
          actifRef.current = true;
          await envoyerPresence(texteLu);
        },
        () => {
          // Erreurs de détection intermédiaires : on ignore, le scan continue.
        },
      );
    } catch (err) {
      scannerRef.current = null;
      setCameraEnCours(false);
      const m = String(err?.message || err || '').toLowerCase();
      if (m.includes('permission') || m.includes('notallowed') || m.includes('denied')) {
        setErreurCamera('Accès à la caméra refusé. Autorisez la caméra dans les réglages du navigateur, ou saisissez le code manuellement.');
      } else if (m.includes('not found') || m.includes('devices')) {
        setErreurCamera('Aucune caméra trouvée sur cet appareil. Utilisez la saisie manuelle ci-dessous.');
      } else if (m.includes('https') || m.includes('secure') || m.includes('insecure')) {
        setErreurCamera('La caméra nécessite une connexion sécurisée (HTTPS) ou localhost. Sur téléphone, utilisez un tunnel HTTPS ou saisissez le code manuellement.');
      } else {
        setErreurCamera('La caméra n’a pas pu démarrer. Utilisez la saisie manuelle ci-dessous.');
      }
    }
  }, [envoyerPresence]);

  const reessayer = useCallback(() => {
    if (dernierCode) envoyerPresence(dernierCode);
  }, [dernierCode, envoyerPresence]);

  return (
    <AppLayout currentPage="scan">
      <div className="mx-auto w-full max-w-md space-y-5 px-4 py-6 sm:max-w-lg sm:px-6" aria-labelledby="scan-titre">
        <div className="space-y-1 text-center">
          <h1 id="scan-titre" className="text-2xl font-bold tracking-tight text-slate-900">Scanner une présence</h1>
          <p className="max-w-prose65 text-base text-slate-600 mx-auto">
            Pointez la caméra vers le QR code de la séance pour enregistrer votre présence.
          </p>
        </div>

        <Card className="space-y-4 p-4 sm:p-5">
          {!cameraEnCours ? (
            <div
              aria-hidden="true"
              className="flex h-56 flex-col items-center justify-center gap-3 rounded-app border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500"
            >
              <QrCode className="h-16 w-16" strokeWidth={1.5} />
              <p className="text-base font-medium">Zone de visée de la caméra</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-app bg-slate-900">
              <div id="lecteur-qr" ref={lecteurRef} className="min-h-56" role="region" aria-label="Lecteur de QR code" />
            </div>
          )}

          {erreurCamera && (
            <Alert variant="warning" title="Caméra indisponible">
              {erreurCamera}
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            {!cameraEnCours ? (
              <Button type="button" variant="primary" size="lg" className="w-full" onClick={demarrerCamera}>
                <Camera aria-hidden="true" className="h-5 w-5" />
                <span>Activer la caméra</span>
              </Button>
            ) : (
              <Button type="button" variant="secondary" size="lg" className="w-full" onClick={arreterCamera}>
                <CameraOff aria-hidden="true" className="h-5 w-5" />
                <span>Arrêter la caméra</span>
              </Button>
            )}
          </div>

          {/* Repli : saisie manuelle systématique (caméra refusée, HTTP, etc.) */}
          <div className="border-t border-slate-100 pt-4">
            <form
              onSubmit={(e) => { e.preventDefault(); envoyerPresence(codeManuel); }}
              className="space-y-3"
              aria-label="Saisie manuelle du code"
            >
              <Input
                id="code-manuel"
                label="Code de la séance (si vous ne pouvez pas scanner)"
                hint="Recopiez le code affiché sous le QR code de l’enseignant."
                placeholder="Ex. 8f4kLmQp2x…"
                value={codeManuel}
                onChange={(e) => setCodeManuel(e.target.value)}
                leadingIcon={Keyboard}
                disabled={envoi}
              />
              <Button type="submit" variant="secondary" size="lg" className="w-full" loading={envoi}>
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                <span>Valider le code</span>
              </Button>
            </form>
          </div>

          {succes && (
            <Alert variant="success" title="Présence enregistrée">
              {succes}
            </Alert>
          )}
          {erreur && (
            <Alert variant="danger" title="Présence non enregistrée">
              <p>{erreur}</p>
              {dernierCode && (
                <div className="mt-3">
                  <Button type="button" variant="secondary" size="md" onClick={reessayer} disabled={envoi}>
                    <RotateCcw aria-hidden="true" className="h-5 w-5" />
                    <span>Réessayer avec ce code</span>
                  </Button>
                </div>
              )}
            </Alert>
          )}
        </Card>

        <p className="flex items-center justify-center gap-2 text-center text-sm text-slate-500">
          {envoi ? (
            <>
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              <span>Envoi de la présence en cours…</span>
            </>
          ) : (
            <span>Le retour est immédiat : vert si la présence est enregistrée, rouge avec la cause sinon.</span>
          )}
        </p>
      </div>
    </AppLayout>
  );
}

export default ScanPage;
