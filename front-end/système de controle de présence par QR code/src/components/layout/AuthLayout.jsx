import { GraduationCap, QrCode, CalendarCheck2, ChartColumn } from 'lucide-react';

/**
 * Gabarit commun aux écrans d'authentification (connexion / inscription).
 * À gauche (grand écran) : rappel du produit — fond bleu foncé, texte blanc (contraste élevé).
 * À droite : le formulaire, centré, sur fond blanc (texte sombre sur fond clair).
 */
const POINTS = [
  { Icon: QrCode, text: 'Un QR code temporaire par séance' },
  { Icon: CalendarCheck2, text: 'Présences enregistrées en quelques secondes' },
  { Icon: ChartColumn, text: 'Statistiques d’assiduité claires et exportables' },
];

function AuthLayout({ children, panelTitle = 'Contrôle de présence par QR code' }) {
  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      {/* Panneau de marque — masqué sur téléphone */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-brand-900/40 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 p-12 text-white lg:flex lg:w-5/12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:18px_18px]"
        />
        <div className="relative flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-app bg-white/10 ring-1 ring-white/25"
          >
            <GraduationCap className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold tracking-tight">Présence QR</span>
        </div>

        <div className="relative my-auto space-y-6">
          <h1 className="max-w-md text-3xl font-extrabold leading-snug tracking-tight text-white">
            {panelTitle}
          </h1>
          <p className="max-w-prose65 text-lg leading-snug text-brand-100">
            Une solution simple et moderne pour gérer les présences en salle de classe.
          </p>
          <ul className="space-y-3">
            {POINTS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-base text-brand-50">
                <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-200" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-brand-200">Système de gestion académique</p>
      </div>

      {/* Formulaire */}
      <main className="flex flex-1 items-center justify-center overflow-y-auto bg-slate-50 px-4 py-8 sm:px-8">
        <div className="w-full max-w-md">
          {/* Marque compacte sur mobile */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-app bg-brand-700 text-white"
            >
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="text-lg font-bold text-slate-900">Présence QR</span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
