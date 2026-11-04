import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Code,
  Database,
  Calculator,
  Network,
  BookOpen,
  BookOpenCheck,
} from "lucide-react";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  Spinner,
} from "./components/ui/index.js";
import { useAuth } from "./context/AuthContext.jsx";

/**
 * Page « Mes cours » — contenu intégré au gabarit AppLayout
 * (barre latérale / navigation mobile fournies par le parent).
 */
function Cours() {
  // L'API actuelle n'expose pas le rôle dans le JWT : fetchProfile() reste prêt
  // pour /api/profile/. On ne restreint rien ici pour préserver l'espace actuel.
  const { utilisateur, role, fetchProfile } = useAuth();
  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000"}/cours/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des cours");
        }

        const data = await response.json();
        if (!cancelled) setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Bouton « Réessayer » : l'état de chargement repart depuis le gestionnaire d'événement
  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  // Filtre de recherche côté client (présentation uniquement)
  const visibleCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((course) =>
      String(course.title || course.nom || "").toLowerCase().includes(q)
    );
  }, [courses, query]);

  // Icône décorative par matière — la couleur reste uniforme (bleu)
  const getCourseIcon = (title) => {
    const lowerTitle = title?.toLowerCase() || '';
    if (lowerTitle.includes('web') || lowerTitle.includes('code')) return Code;
    if (lowerTitle.includes('donnée') || lowerTitle.includes('sql')) return Database;
    if (lowerTitle.includes('math')) return Calculator;
    if (lowerTitle.includes('réseau') || lowerTitle.includes('network')) return Network;
    return BookOpen;
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête de page : titre + action principale toujours au même endroit (droite) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mes cours</h1>
          <p className="text-base text-slate-600">
            Retrouvez et gérez les cours qui vous sont assignés.
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus aria-hidden="true" className="h-5 w-5" />
          <span>Créer un cours</span>
        </Button>
      </div>

      {/* Recherche */}
      <Input
        id="recherche-cours"
        type="search"
        label="Rechercher un cours"
        placeholder="Rechercher par nom…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leadingIcon={Search}
        className="max-w-md"
      />

      {/* États : chargement / erreur / vide / liste */}
      {loading && <Spinner label="Chargement des cours…" />}

      {!loading && error && (
        <Alert
          variant="danger"
          title="Impossible de charger les cours"
        >
          <p>{error}. Vérifiez votre connexion puis réessayez.</p>
          <div className="mt-3">
            <Button variant="secondary" size="md" onClick={retry}>
              Réessayer
            </Button>
          </div>
        </Alert>
      )}

      {!loading && !error && visibleCourses.length === 0 && (
        query.trim() ? (
          <EmptyState
            icon={Search}
            title="Aucun résultat"
            description={`Aucun cours ne correspond à « ${query.trim()} ». Modifiez votre recherche.`}
            action={
              <Button variant="secondary" size="md" onClick={() => setQuery("")}>
                Effacer la recherche
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={BookOpenCheck}
            title="Aucun cours pour l'instant"
            description="Vous n'avez pas encore de cours assigné. Créez votre premier cours pour commencer."
          />
        )
      )}

      {!loading && !error && visibleCourses.length > 0 && (
        <ul className="space-y-3">
          {visibleCourses.map((course) => {
            const IconComponent = getCourseIcon(course.title || course.nom);
            const name = course.title || course.nom;

            return (
              <li key={course.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-md">
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-app bg-brand-50 text-brand-700"
                    >
                      <IconComponent className="h-6 w-6" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-slate-900">
                        {name}
                      </h2>
                      <p className="text-sm text-slate-600">
                        {course.subtitle || `${course.niveau || ''} - ${course.filiere || ''} | ${course.nb_seances || 0} séance(s)`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Options du cours ${name}`}
                    aria-haspopup="menu"
                    title={`Options du cours ${name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-app text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  >
                    <MoreVertical aria-hidden="true" className="h-5 w-5" />
                  </button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Cours;
