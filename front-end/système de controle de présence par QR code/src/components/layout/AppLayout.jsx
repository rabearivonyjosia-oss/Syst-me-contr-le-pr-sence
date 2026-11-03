import {
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Home,
  LogOut,
  UserRound,
  Users,
} from 'lucide-react';

/**
 * Gabarit principal de l'application (enseignant).
 * - Navigation identique sur toutes les pages ; page courante clairement indiquée
 *   (fond + aria-current="page" + libellé, jamais la couleur seule).
 * - Bureau : barre latérale fixe. Téléphone : barre inférieure à 5 destinations,
 *   cibles ≥ 44 px, icône + libellé.
 * - Lien d'évitement « Aller au contenu » pour le clavier.
 */
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Accueil', Icon: Home },
  { key: 'cours', label: 'Cours', Icon: BookOpen },
  { key: 'seances', label: 'Séances', Icon: CalendarDays },
  { key: 'etudiants', label: 'Étudiants', Icon: Users },
  { key: 'profil', label: 'Profil', Icon: UserRound },
];

function AppLayout({ currentPage, onNavigate, onLogout, children }) {
  const navButtonClass = (key) =>
    `flex w-full items-center gap-3 rounded-app px-3 py-2.5 text-base font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${
      currentPage === key
        ? 'bg-brand-700 text-white'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex min-h-screen w-full bg-slate-100 font-sans text-slate-800">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>

      {/* Barre latérale — bureau */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-app bg-brand-700 text-white"
            >
              <GraduationCap className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <p className="text-base font-bold text-slate-900">Présence QR</p>
              <p className="text-xs text-slate-500">Espace enseignant</p>
            </div>
          </div>

          <nav aria-label="Navigation principale" className="space-y-1">
            {NAV_ITEMS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                aria-current={currentPage === key ? 'page' : undefined}
                className={navButtonClass(key)}
              >
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-app px-3 py-2.5 text-base font-medium text-danger-700 transition-colors hover:bg-danger-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-danger-700"
        >
          <LogOut aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* Contenu principal */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <GraduationCap aria-hidden="true" className="h-6 w-6 text-brand-700" />
            <span className="font-bold text-slate-900">Présence QR</span>
          </div>
          <p className="hidden text-sm font-semibold text-slate-500 md:block">
            Espace enseignant
          </p>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications, 1 non lue"
              title="Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
              <span
                aria-hidden="true"
                className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-600"
              />
            </button>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800"
              >
                MR
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold text-slate-900">Mr / Mdm</span>
                <span className="block text-xs text-slate-500">Enseignant</span>
              </span>
            </div>
          </div>
        </header>

        <main id="contenu" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {children}
        </main>
      </div>

      {/* Barre inférieure — téléphone (cibles ≥ 44 px, icône + libellé) */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 md:hidden"
      >
        <ul className="flex items-stretch justify-around">
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const active = currentPage === key;
            return (
              <li key={key} className="flex-1">
                <button
                  type="button"
                  onClick={() => onNavigate(key)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-app px-1 py-1 transition-colors ${
                    active ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default AppLayout;
