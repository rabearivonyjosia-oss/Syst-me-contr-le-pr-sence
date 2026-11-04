import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Users,
  CalendarX2,
  ArrowRight,
  Clock,
} from "lucide-react";
import AppLayout from './components/layout/AppLayout.jsx';
import Cours from './cours.jsx';
import { Button, Card, EmptyState } from './components/ui/index.js';
import { Placeholder } from './pages/Placeholder.jsx';
import Profil from './profile.jsx';
import ScanPage from './pages/Scan.jsx';

// Correspondance entre le nom d'une page et son URL (doit rester identique à App.jsx)
const ROUTES = {
  dashboard: '/accueil',
  cours: '/cours',
  seances: '/seances',
  statistiques: '/statistiques',
  scan: '/scan',
  profil: '/profil',
};

// Clés de stockage à vider à la déconnexion : adapte-les à celles de ton login.jsx
const CLES_SESSION = ['token', 'access', 'refresh', 'user', 'role'];

// Statistiques : Phase 4 (gabarit commun + message explicite, pas de données factices).
function StatistiquesPlaceholder({ onAction }) {
  return (
    <Placeholder
      titre="Statistiques"
      description="Les graphiques et les exports (CSV/PDF/Excel) arrivent en Phase 4. Aucune statistique factice n'est affichée."
      icone={BookOpenCheck}
      actionLabel="Retour à l'accueil"
      onAction={onAction}
    />
  );
}

function Dashboard({ onLogout, page }) {
  // Les hooks doivent être appelés avant tout "return" conditionnel
  const navigate = useNavigate();

  const currentPage = page || 'dashboard';

  // Navigation par URL (react-router) à la place de l'ancien état "setCurrentPage"
  const goTo = (key) => navigate(ROUTES[key] ?? '/');

  const handleLogout =
    onLogout ||
    (() => {
      CLES_SESSION.forEach((cle) => localStorage.removeItem(cle));
      navigate('/connexion', { replace: true });
    });

  // Écrans qui ont leur propre AppLayout
  if (currentPage === 'scan') {
    return <ScanPage />;
  }
  if (currentPage === 'profil') {
    return <Profil />;
  }

  // Indicateurs : une seule couleur (bleu) — l'information est portée par le libellé et le chiffre
  // TODO : remplacer ces valeurs par les données de l'API (/api/stats/...)
  const stats = [
    { label: "Mes cours", value: 3, icon: BookOpen },
    { label: "Séances aujourd'hui", value: 1, icon: CalendarDays },
    { label: "Étudiants présents", value: 12, icon: Users },
    { label: "Total étudiants", value: 45, icon: Users },
  ];

  // TODO : remplacer par les vraies séances de l'API
  const upcomingSessions = [
    { id: 1, title: "Développement Web", niveau: "L1 - Informatique", date: "14 oct. 2025 · 08:00 - 10:00" },
    { id: 2, title: "Base de données", niveau: "L2 - Informatique", date: "14 oct. 2025 · 10:00 - 12:00" },
    { id: 3, title: "Mathématiques", niveau: "L1 - MIAGE", date: "14 oct. 2025 · 14:00 - 16:00" },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case "cours":
        return <Cours />;

      case "statistiques":
        return <StatistiquesPlaceholder onAction={() => goTo("dashboard")} />;

      case "seances":
        return (
          <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Séances</h1>
            <EmptyState
              icon={CalendarX2}
              title="Aucune séance planifiée"
              description="Les prochaines séances de vos cours apparaîtront ici. Créez une séance depuis la page du cours concerné."
              action={
                <Button variant="secondary" size="md" onClick={() => goTo("cours")}>
                  Voir mes cours
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Button>
              }
            />
          </div>
        );

      case "dashboard":
      default:
        return (
          <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Bonjour
              </h1>
              <p className="max-w-prose text-base text-slate-600">
                Voici un aperçu de votre activité du jour.
              </p>
            </div>

            {/* Indicateurs */}
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="flex items-center justify-between gap-3 p-4 sm:p-5">
                    <div className="space-y-1">
                      <dt className="text-sm font-medium text-slate-600">{stat.label}</dt>
                      <dd className="text-2xl font-bold tabular-nums text-slate-900">{stat.value}</dd>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-app bg-brand-50 text-brand-700"
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                  </Card>
                );
              })}
            </dl>

            {/* Prochaines séances */}
            <section aria-labelledby="prochaines-seances" className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 id="prochaines-seances" className="text-xl font-bold text-slate-900">
                  Prochaines séances
                </h2>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => goTo("seances")}
                  className="text-brand-700 hover:bg-brand-50 hover:text-brand-800"
                >
                  <span>Voir tout</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>

              <ul className="space-y-3">
                {upcomingSessions.map((session) => (
                  <li key={session.id}>
                    <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md">
                      <div className="flex min-w-0 items-center gap-4">
                        <span
                          aria-hidden="true"
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-app bg-brand-50 text-brand-700"
                        >
                          <BookOpen className="h-6 w-6" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold leading-snug text-slate-900">
                            {session.title}
                          </h3>
                          <p className="text-sm text-slate-600">{session.niveau}</p>
                        </div>
                      </div>

                      <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                        <p className="flex items-center gap-1.5 rounded-app border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium tabular-nums text-slate-700">
                          <Clock aria-hidden="true" className="h-4 w-4 text-slate-500" />
                          <span>{session.date}</span>
                        </p>
                        <Button variant="secondary" size="md" onClick={() => goTo("seances")}>
                          Voir
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        );
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={goTo} onLogout={handleLogout}>
      {renderContent()}
    </AppLayout>
  );
}

export default Dashboard;