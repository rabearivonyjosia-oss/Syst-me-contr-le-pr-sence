import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CircleHelp,
  ClipboardList,
  KeyRound,
  QrCode,
  ScanLine,
  ShieldCheck,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import { Card, CardBody, CardHeader, PageHeader } from '../components/ui/index.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

function Etape({ numero, titre, children }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white"
      >
        {numero}
      </span>
      <div className="min-w-0 space-y-1">
        <p className="font-semibold text-slate-900">{titre}</p>
        <div className="text-sm text-slate-700">{children}</div>
      </div>
    </li>
  );
}

function Aide() {
  usePageTitle('Aide');

  return (
    <Page>
      <PageHeader
        titre="Aide et bonnes pratiques"
        description="Tout ce qu’il faut savoir pour gérer les cours, projeter le QR code et suivre les présences."
        icone={CircleHelp}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Côté enseignant"
            description="Préparer une séance, projeter le QR code et corriger la feuille de présence."
          />
          <CardBody>
            <ol className="space-y-4">
              <Etape numero="1" titre="Créer un cours">
                Depuis <Link to="/cours">Cours</Link>, créez le cours puis inscrivez les
                étudiants. Un cours regroupe un enseignant, un niveau et un groupe
                d’étudiants.
              </Etape>
              <Etape numero="2" titre="Planifier une séance">
                Depuis <Link to="/seances">Séances</Link>, choisissez la date, les
                horaires, la salle et le type. Les chevauchements de salle et
                d’enseignant sont refusés.
              </Etape>
              <Etape numero="3" titre="Projeter le QR code">
                Ouvrez la séance puis « Afficher le QR code ». Le code est disponible de
                10 minutes avant le début jusqu’à la fin de la séance. Il se renouvelle
                automatiquement toutes les 60 secondes.
              </Etape>
              <Etape numero="4" titre="Contrôler et corriger">
                La <Link to="/seances">feuille de présence</Link> liste les inscrits.
                Vous pouvez passer un étudiant en présent, absent ou justifié, avec un
                motif facultatif.
              </Etape>
              <Etape numero="5" titre="Analyser et exporter">
                Les <Link to="/statistiques">statistiques</Link> se filtrent par cours et
                par période. L’export CSV est encodé en UTF-8 avec un point-virgule
                comme séparateur, pour Excel.
              </Etape>
            </ol>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Côté étudiant"
            description="Scanner le QR code pendant la séance et vérifier sa présence."
          />
          <CardBody>
            <ol className="space-y-4">
              <Etape numero="1" titre="Se connecter">
                Utilisez l’adresse email et le mot de passe de votre compte étudiant.
                L’inscription autonome est réservée aux étudiants.
              </Etape>
              <Etape numero="2" titre="Ouvrir le scanner">
                Depuis l’accueil ou l’onglet <Link to="/scan">Scanner</Link>, autorisez
                la caméra. Si elle est indisponible, saisissez le code affiché sous le
                QR code.
              </Etape>
              <Etape numero="3" titre="Scanner pendant la séance">
                Le scan est accepté uniquement pendant la séance, pas avant l’heure de
                début ni après la fin. Un QR code expiré doit être remplacé par le code
                affiché à l’écran.
              </Etape>
              <Etape numero="4" titre="Vérifier son statut">
                La page de la séance et vos <Link to="/statistiques">statistiques</Link>{' '}
                affichent votre présence. En cas d’erreur, demandez une correction à
                votre enseignant.
              </Etape>
            </ol>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Règles du QR code"
            description="Comprendre les messages affichés pendant le scan."
          />
          <CardBody className="space-y-3 text-sm text-slate-700">
            <p className="flex items-start gap-2">
              <QrCode aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <span>
                <strong>QR invalide :</strong> le code ne correspond à aucune séance ou a
                été remplacé. Scannez le code affiché à l’écran.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <KeyRound aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <span>
                <strong>QR expiré :</strong> le code a dépassé sa durée de validité.
                Attendez le renouvellement automatique ou demandez à l’enseignant de le
                renouveler.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <ScanLine aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <span>
                <strong>Présence déjà enregistrée :</strong> votre présence existe déjà.
                Ce message est une information : aucun doublon n’est créé.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <span>
                <strong>Séance terminée :</strong> l’émargement est fermé. Seul
                l’enseignant peut corriger votre statut.
              </span>
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Accessibilité et raccourcis"
            description="L’interface est utilisable au clavier et sur téléphone."
          />
          <CardBody className="space-y-3 text-sm text-slate-700">
            <p>
              <strong>Clavier :</strong> appuyez sur Tab pour parcourir les liens et les
              boutons. Le premier élément de la page permet d’aller directement au
              contenu principal. Échap ferme une boîte de dialogue.
            </p>
            <p>
              <strong>Mobiles :</strong> les cibles tactiles font au moins 44 pixels de
              haut. Les tableaux deviennent des cartes étiquetées sur petit écran.
            </p>
            <p>
              <strong>Contrastes :</strong> les statuts combinent une couleur, une icône
              et un libellé pour rester lisibles en cas de daltonisme.
            </p>
            <p>
              <strong>Hors ligne :</strong> un bandeau vous prévient. Les actions
              reprennent dès que la connexion est rétablie.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Questions fréquentes" />
        <CardBody className="space-y-2">
          <details className="rounded-app border border-slate-200 px-4 py-3">
            <summary className="cursor-pointer font-semibold text-slate-900">
              Pourquoi la caméra ne démarre-t-elle pas ?
            </summary>
            <p className="mt-2 text-sm text-slate-700">
              L’accès à la caméra exige HTTPS ou localhost, et une autorisation du
              navigateur. Sur téléphone, vérifiez aussi que le navigateur a la
              permission « Caméra ». La saisie manuelle du code reste disponible dans
              tous les cas.
            </p>
          </details>
          <details className="rounded-app border border-slate-200 px-4 py-3">
            <summary className="cursor-pointer font-semibold text-slate-900">
              Puis-je scanner avant le début de la séance ?
            </summary>
            <p className="mt-2 text-sm text-slate-700">
              Le QR code peut être projeté 10 minutes avant, mais l’émargement n’est
              accepté qu’à partir de l’heure de début et jusqu’à l’heure de fin.
            </p>
          </details>
          <details className="rounded-app border border-slate-200 px-4 py-3">
            <summary className="cursor-pointer font-semibold text-slate-900">
              Comment vérifier qu’un étudiant est bien inscrit ?
            </summary>
            <p className="mt-2 text-sm text-slate-700">
              Ouvrez le cours puis la section « Étudiants inscrits ». Un étudiant non
              inscrit ne peut pas scanner le QR code et son absence n’apparaît pas dans
              les statistiques du cours.
            </p>
          </details>
          <details className="rounded-app border border-slate-200 px-4 py-3">
            <summary className="cursor-pointer font-semibold text-slate-900">
              Le fichier CSV s’ouvre mal dans Excel ?
            </summary>
            <p className="mt-2 text-sm text-slate-700">
              L’export contient un BOM UTF-8 et utilise le point-virgule, ce qui
              convient à la configuration française d’Excel. Si nécessaire, utilisez
              « Données » puis « À partir d’un fichier texte » et choisissez UTF-8 et le
              séparateur point-virgule.
            </p>
          </details>
          <details className="rounded-app border border-slate-200 px-4 py-3">
            <summary className="cursor-pointer font-semibold text-slate-900">
              Qui peut voir les statistiques ?
            </summary>
            <p className="mt-2 text-sm text-slate-700">
              Les enseignants voient leurs propres cours, les administrateurs voient
              l’ensemble et les étudiants voient uniquement leurs présences.
            </p>
          </details>
        </CardBody>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <ClipboardList aria-hidden="true" className="h-4 w-4" />
          Besoin d’une correction ? Contactez votre enseignant ou l’administration.
        </p>
        <Link
          to="/accueil"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-app px-3 text-sm font-semibold text-brand-700 no-underline hover:bg-brand-50"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Retour à l’accueil
        </Link>
      </div>

    </Page>
  );
}

export default Aide;
