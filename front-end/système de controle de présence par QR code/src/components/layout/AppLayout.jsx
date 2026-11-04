import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  ChartColumn,
  CircleHelp,
  GraduationCap,
  Home,
  LogOut,
  QrCode,
  UserRound,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useEnLigne } from '../../hooks/useRequete.js';
import { initiales } from '../../utils/format.js';
import { LIBELLES_ROLE } from '../../utils/constants.js';

/**
 * Gabarit principal.
 * - Navigation filtrée par rôle (6 entrées au maximum sur bureau) ;
 * - barre inférieure mobile limitée à 5 destinations, cibles de 44 px ;
 * - page courante signalée par aria-current + libellé + icône ;
 * - lien d'évitement clavier, bannière hors-ligne, identité et déconnexion.
 */
const NAV_ITEMS = [
  { key: 'accueil', to: '/accueil', label: 'Accueil', Icon: Home, mobile: true, roles: null, end: true },
  { key: 'cours', to: '/cours', label: 'Cours', Icon: BookOpen, mobile: true, roles: null },
  { key: 'scan', to: '/scan', label: 'Scanner', Icon: QrCode, mobile: true, roles: ['ETUDIANT'] },
  { key: 'seances', to: '/seances', label: 'Séances', Icon: CalendarDays, mobile: true, roles: null },
  {
    key: 'statistiques',
    to: '/statistiques',
    label: 'Statistiques',
    Icon: ChartColumn,
    mobile: true,
    roles: null,
  },
  { key: 'aide', to: '/aide', label: 'Aide', Icon: CircleHelp, mobile: false, roles: null },
  { key: 'profil', to: '/profil', label: 'Profil', Icon: UserRound, mobile: true, roles: null },
];

function AppLayout() {
  const { utilisateur, role, deconnexion } = useAuth();
  const navigate = useNavigate();
  const enLigne = useEnLigne();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role),
  );
  const itemsMobile = items.filter((item) => item.mobile).slice(0, 5);

  const nomAffiche = utilisateur?.nom_complet || utilisateur?.username || 'Mon compte';
  const roleAffiche = LIBELLES_ROLE[role] ?? 'Utilisateur';

  const deconnecter = async () => {
    await deconnexion();
    navigate('/connexion', { replace: true });
  };

  const classeNav = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-app px-3 py-2.5 text-base font-medium transition-colors ${
      isActive
        ? 'bg-brand-700 text-white'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex min-h-screen w-full bg-slate-100 font-sans text-slate-800">
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>

      {/* --- Barre latérale bureau ------------------------------------- */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 md:flex">
        <div className="space-y-6">
          <Link
            to="/accueil"
            className="flex items-center gap-3 rounded-app px-2 py-3 no-underline"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-app bg-brand-700 text-white"
            >
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold text-slate-900">Présence QR</span>
              <span className="block text-xs text-slate-500">
                {role === 'ETUDIANT' ? 'Espace étudiant' : 'Espace enseignant'}
              </span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="space-y-1">
            {items.map(({ key, to, label, Icon, end }) => (
              <NavLink key={key} to={to} end={end} className={classeNav}>
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <Link
            to="/profil"
            className="flex items-center gap-3 rounded-app p-2 no-underline transition-colors hover:bg-slate-50"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800"
            >
              {initiales(nomAffiche)}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {nomAffiche}
              </span>
              <span className="block text-xs text-slate-500">{roleAffiche}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={deconnecter}
            className="flex w-full items-center gap-3 rounded-app px-3 py-2.5 text-base font-medium text-danger-700 transition-colors hover:bg-danger-50"
          >
            <LogOut aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* --- Contenu ---------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <GraduationCap aria-hidden="true" className="h-6 w-6 shrink-0 text-brand-700" />
            <span className="truncate font-bold text-slate-900">Présence QR</span>
          </div>
          <p className="hidden text-sm font-semibold text-slate-500 md:block">
            {role === 'ETUDIANT' ? 'Espace étudiant' : 'Espace enseignant'}
          </p>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Link
              to="/aide"
              aria-label="Aide et raccourcis"
              title="Aide"
              className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 no-underline transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <CircleHelp aria-hidden="true" className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={deconnecter}
              aria-label="Se déconnecter"
              title="Déconnexion"
              className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-danger-50 hover:text-danger-700 md:hidden"
            >
              <LogOut aria-hidden="true" className="h-5 w-5" />
            </button>
            <Link
              to="/profil"
              className="flex items-center gap-2 border-l border-slate-200 pl-2 no-underline sm:pl-3"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800"
              >
                {initiales(nomAffiche)}
              </span>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block max-w-40 truncate text-sm font-semibold text-slate-900">
                  {nomAffiche}
                </span>
                <span className="block text-xs text-slate-500">{roleAffiche}</span>
              </span>
            </Link>
          </div>
        </header>

        {!enLigne && (
          <div
            role="status"
            className="flex items-center justify-center gap-2 border-b border-warning-200 bg-warning-50 px-4 py-2 text-sm font-medium text-warning-800"
          >
            <WifiOff aria-hidden="true" className="h-4 w-4 shrink-0" />
            Vous êtes hors ligne. Les actions seront impossibles tant que la connexion
            n’est pas rétablie.
          </div>
        )}

        <main id="contenu" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <Outlet />
        </main>
      </div>

      {/* --- Barre inférieure téléphone -------------------------------- */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 md:hidden"
      >
        <ul className="flex items-stretch justify-around">
          {itemsMobile.map(({ key, to, label, Icon, end }) => (
            <li key={key} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-app px-1 py-1 transition-colors ${
                    isActive ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      aria-hidden="true"
                      className="h-6 w-6"
                      strokeWidth={isActive ? 2.25 : 1.75}
                    />
                    <span className="text-xs font-semibold">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default AppLayout;
