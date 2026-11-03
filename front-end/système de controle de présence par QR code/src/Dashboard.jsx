import {
  BookOpen,
  CalendarDays,
  Users,
  CalendarX2,
  ArrowRight,
  Clock,
  GraduationCap,
} from "lucide-react";
import AppLayout from './components/layout/AppLayout.jsx';
import Cours from './cours.jsx';
import { Button, Card, EmptyState } from './components/ui/index.js';

function Dashboard({ onLogout, currentPage, setCurrentPage }) {
  // Indicateurs : une seule couleur (bleu) — l'information est portée par le libellé et le chiffre
  const stats = [
    { label: "Mes cours", value: 3, icon: BookOpen },
    { label: "Séances aujourd'hui", value: 1, icon: CalendarDays },
    { label: "Étudiants présents", value: 12, icon: Users },
    { label: "Total étudiants", value: 45, icon: Users },
  ];

  const upcomingSessions = [
    { id: 1, title: "Développement Web", niveau: "L1 - Informatique", date: "14 oct. 2025 · 08:00 - 10:00" },
    { id: 2, title: "Base de données", niveau: "L2 - Informatique", date: "14 oct. 2025 · 10:00 - 12:00" },
    { id: 3, title: "Mathématiques", niveau: "L1 - MIAGE", date: "14 oct. 2025 · 14:00 - 16:00" },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case "cours":
        return <Cours />;

      case "seances":
        return (
          <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Séances</h1>
            <EmptyState
              icon={CalendarX2}
              title="Aucune séance planifiée"
              description="Les prochaines séances de vos cours apparaîtront ici. Créez une séance depuis la page du cours concerné."
              action={
                <Button variant="secondary" size="md" onClick={() => setCurrentPage("cours")}>
                  Voir mes cours
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Button>
              }
            />
          </div>
        );

      case "etudiants":
        return (
          <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Étudiants</h1>
            <EmptyState
              icon={Users}
              title="Aucun étudiant à afficher"
              description="La liste des étudiants inscrits à vos cours s'affichera ici, avec leur statut de présence par séance."
            />
          </div>
        );

      case "profil":
        return (
          <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mon profil</h1>
            <Card className="flex flex-wrap items-center gap-4 p-6">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"
              >
                <GraduationCap className="h-8 w-8" strokeWidth={1.75} />
              </span>
              <div className="space-y-0.5">
                <p className="text-xl font-bold text-slate-900">Mr / Mdm</p>
                <p className="text-base text-slate-600">Enseignant — informations du compte à compléter.</p>
              </div>
            </Card>
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
              <p className="max-w-prose65 text-base text-slate-600">
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
                  onClick={() => setCurrentPage("seances")}
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
                        <Button variant="secondary" size="md" onClick={() => setCurrentPage("seances")}>
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
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={onLogout}>
      {renderContent()}
    </AppLayout>
  );
}

export default Dashboard;
