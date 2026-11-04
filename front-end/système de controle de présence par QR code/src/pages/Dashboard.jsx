import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  ChartColumn,
  Clock,
  MapPin,
  Plus,
  QrCode,
  Users,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  SkeletonCarte,
  StatCard,
  StatutPresenceBadge,
  StatutSeanceBadge,
} from '../components/ui/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useRequete } from '../hooks/useRequete.js';
import { seancesApi, statsApi } from '../services/api.js';
import {
  aujourdHuiIso,
  formatDateLongue,
  formatHeure,
  formatPourcentage,
} from '../utils/format.js';

function CarteSeance({ seance, estEtudiant }) {
  return (
    <li>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-app border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-app bg-brand-50 text-brand-700"
          >
            <Clock className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-base font-semibold text-slate-900">
              {seance.cours_nom}
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
              <span className="tabular-nums">
                {formatHeure(seance.heure_debut)} – {formatHeure(seance.heure_fin)}
              </span>
              {seance.salle && (
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                  {seance.salle}
                </span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatutSeanceBadge statut={seance.statut} />
              {estEtudiant && seance.ma_presence && (
                <StatutPresenceBadge statut={seance.ma_presence.statut} />
              )}
            </div>
          </div>
        </div>
        <Link
          to={`/seances/${seance.id}`}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-app px-3 text-sm font-semibold text-brand-700 no-underline hover:bg-brand-50"
        >
          Détails
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </li>
  );
}

function Dashboard() {
  const { utilisateur, estEtudiant, estGestionnaire } = useAuth();
  const navigate = useNavigate();

  usePageTitle('Accueil');

  const charger = useCallback(async () => {
    const [stats, liste] = await Promise.all([
      statsApi.get(),
      seancesApi.list({ page_size: 100, ordering: 'date_seance,heure_debut' }),
    ]);
    return { stats, seances: liste.results ?? [] };
  }, []);

  const { donnees, chargement, erreur, recharger } = useRequete(charger);

  const dateJour = aujourdHuiIso();
  const seances = donnees?.seances ?? [];
  const seancesJour = seances.filter((seance) => seance.date_seance === dateJour);
  const prochaines = seances
    .filter((seance) => seance.statut === 'A_VENIR')
    .slice(0, 4);
  const resume = donnees?.stats?.resume;
  const prenom = utilisateur?.first_name || utilisateur?.username || '';

  return (
    <Page>
      <PageHeader
        titre={prenom ? `Bonjour, ${prenom}` : 'Bonjour'}
        description={`${formatDateLongue(dateJour)} · ${
          estEtudiant ? 'votre espace étudiant' : 'votre espace enseignant'
        }`}
        action={
          estEtudiant ? (
            <Button variant="primary" onClick={() => navigate('/scan')}>
              <QrCode aria-hidden="true" className="h-5 w-5" />
              Scanner un QR code
            </Button>
          ) : (
            <Button variant="primary" onClick={() => navigate('/seances')}>
              <CalendarPlus aria-hidden="true" className="h-5 w-5" />
              Planifier une séance
            </Button>
          )
        }
      />

      {chargement && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCarte key={index} />
            ))}
          </div>
          <SkeletonCarte className="h-64" />
        </>
      )}

      {!chargement && erreur && (
        <ErrorState
          titre="Tableau de bord indisponible"
          erreur={erreur}
          onRetry={recharger}
        />
      )}

      {!chargement && !erreur && resume && (
        <>
          <section aria-labelledby="indicateurs-titre" className="space-y-3">
            <h2 id="indicateurs-titre" className="sr-only">
              Indicateurs clés
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                titre={estEtudiant ? 'Mes cours' : 'Cours'}
                valeur={resume.nb_cours}
                icone={BookOpen}
                description="Cours accessibles"
              />
              <StatCard
                titre="Séances"
                valeur={resume.nb_seances}
                icone={CalendarDays}
                description={`${resume.nb_seances_aujourdhui} aujourd’hui`}
                variant="warning"
              />
              <StatCard
                titre="Taux de présence"
                valeur={formatPourcentage(resume.taux_presence)}
                icone={ChartColumn}
                description={`${resume.presents} présent(s) sur ${resume.attendu} attendu(s)`}
                variant="success"
              />
              {estEtudiant ? (
                <StatCard
                  titre="Présences enregistrées"
                  valeur={resume.presents}
                  icone={QrCode}
                  description={`${resume.justifies} justifiée(s)`}
                />
              ) : (
                <StatCard
                  titre="Étudiants"
                  valeur={resume.nb_etudiants}
                  icone={Users}
                  description="Dans votre périmètre"
                />
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section aria-labelledby="aujourdhui-titre" className="space-y-3 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="aujourdhui-titre" className="text-xl font-bold text-slate-900">
                  Aujourd’hui
                </h2>
                <Link to="/seances" className="text-sm font-semibold text-brand-700">
                  Toutes les séances
                </Link>
              </div>
              {seancesJour.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Aucune séance aujourd’hui"
                  description={
                    prochaines.length > 0
                      ? 'Vos prochaines séances sont listées à côté.'
                      : 'Le planning est vide pour le moment.'
                  }
                  action={
                    estGestionnaire ? (
                      <Button variant="secondary" onClick={() => navigate('/seances')}>
                        <Plus aria-hidden="true" className="h-5 w-5" />
                        Planifier une séance
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {seancesJour.map((seance) => (
                    <CarteSeance
                      key={seance.id}
                      seance={seance}
                      estEtudiant={estEtudiant}
                    />
                  ))}
                </ul>
              )}
            </section>

            <aside className="space-y-6">
              <section aria-labelledby="avenir-titre" className="space-y-3">
                <h2 id="avenir-titre" className="text-xl font-bold text-slate-900">
                  À venir
                </h2>
                {prochaines.length === 0 ? (
                  <p className="rounded-app border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-600">
                    Aucune séance à venir.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {prochaines.map((seance) => (
                      <li key={seance.id}>
                        <Link
                          to={`/seances/${seance.id}`}
                          className="flex items-center justify-between gap-3 rounded-app border border-slate-200 bg-white p-3 no-underline shadow-card transition-colors hover:bg-brand-50"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {seance.cours_nom}
                            </span>
                            <span className="block text-xs text-slate-600">
                              {formatDateLongue(seance.date_seance)} ·{' '}
                              {formatHeure(seance.heure_debut)}
                            </span>
                          </span>
                          <Badge variant="info">
                            {seance.statut_libelle || 'À venir'}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section
                aria-labelledby="actions-titre"
                className="space-y-3 rounded-app border border-slate-200 bg-white p-4 shadow-card"
              >
                <h2 id="actions-titre" className="text-lg font-bold text-slate-900">
                  Actions rapides
                </h2>
                <div className="flex flex-col gap-2">
                  {estEtudiant && (
                    <Button variant="secondary" onClick={() => navigate('/scan')}>
                      <QrCode aria-hidden="true" className="h-5 w-5" />
                      Scanner une présence
                    </Button>
                  )}
                  {estGestionnaire && (
                    <>
                      <Button variant="secondary" onClick={() => navigate('/cours')}>
                        <BookOpen aria-hidden="true" className="h-5 w-5" />
                        Gérer mes cours
                      </Button>
                      <Button variant="secondary" onClick={() => navigate('/seances')}>
                        <CalendarDays aria-hidden="true" className="h-5 w-5" />
                        Créer une séance
                      </Button>
                    </>
                  )}
                  <Button variant="secondary" onClick={() => navigate('/statistiques')}>
                    <ChartColumn aria-hidden="true" className="h-5 w-5" />
                    Voir les statistiques
                  </Button>
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
    </Page>
  );
}

export default Dashboard;
