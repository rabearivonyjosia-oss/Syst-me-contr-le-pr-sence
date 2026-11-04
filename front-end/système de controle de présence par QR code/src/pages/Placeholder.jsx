import { ArrowRight } from 'lucide-react';
import { Button, EmptyState } from '../components/ui/index.js';

/*
 * Page d'attente propre (Phase 2) : gardes le gabarit commun et annonce
 * explicitement « à brancher », plutôt qu'un état vide factice.
 * Utilisée pour les écrans de Phase 3/4 non encore construits.
 */
export function Placeholder({ titre, description, icone, actionLabel, onAction }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{titre}</h1>
      <EmptyState
        icon={icone}
        title={`${titre} — bientôt disponible`}
        description={description}
        action={
          actionLabel ? (
            <Button variant="secondary" size="md" onClick={onAction}>
              {actionLabel}
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

export function AccesRefuse() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <Placeholder
        titre="Accès refusé"
        description="Vous n’avez pas les droits d’accès à cette page. Revenez à votre accueil."
        icone={ArrowRight}
        actionLabel="Retour à l’accueil"
        onAction={() => window.location.assign('/accueil')}
      />
    </div>
  );
}

export function PageNonTrouvee() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-10 sm:px-6">
      <div className="space-y-4 text-center">
        <p className="text-base font-semibold text-brand-700">Erreur 404</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Page introuvable</h1>
        <p className="mx-auto max-w-prose65 text-base text-slate-600">
          La page que vous cherchez n’existe pas ou a été déplacée. Vérifiez l’adresse puis
          revenez à votre accueil.
        </p>
        <Button variant="primary" size="md" onClick={() => window.location.assign('/accueil')}>
          Retour à l’accueil
        </Button>
      </div>
    </div>
  );
}

export default Placeholder;
