import { Link } from 'react-router-dom';
import { Home, LogIn, SearchX } from 'lucide-react';

/**
 * Page 404 autonome : elle est affichée hors du gabarit protégé, car une URL
 * inconnue peut être ouverte avant connexion. Aucune donnée utilisateur n'est
 * nécessaire.
 */
function NonTrouvee() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 font-sans">
      <main className="w-full max-w-lg rounded-app border border-slate-200 bg-white p-6 text-center shadow-card sm:p-8">
        <span
          aria-hidden="true"
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"
        >
          <SearchX className="h-8 w-8" strokeWidth={1.75} />
        </span>
        <p className="mt-4 text-sm font-bold uppercase tracking-wide text-brand-700">
          Erreur 404
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Page introuvable</h1>
        <p className="mt-2 text-base text-slate-600">
          L’adresse demandée n’existe pas ou a été déplacée. Vérifiez le lien ou
          revenez à l’accueil de l’application.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            to="/accueil"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-app bg-brand-700 px-4 font-semibold text-white no-underline hover:bg-brand-800"
          >
            <Home aria-hidden="true" className="h-5 w-5" />
            Aller à l’accueil
          </Link>
          <Link
            to="/connexion"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-app border border-slate-300 bg-white px-4 font-semibold text-slate-800 no-underline hover:bg-slate-50"
          >
            <LogIn aria-hidden="true" className="h-5 w-5" />
            Se connecter
          </Link>
        </div>
      </main>
    </div>
  );
}

export default NonTrouvee;
