import { Link } from 'react-router-dom';
import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import { Card, CardBody, PageHeader } from '../components/ui/index.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

/**
 * Page 403 dédiée : l'utilisateur est connecté mais son rôle ne donne pas
 * accès à la ressource demandée. On propose toujours une sortie claire.
 */
function AccesRefuse() {
  usePageTitle('Accès refusé');

  return (
    <Page>
      <PageHeader
        titre="Accès refusé"
        description="Votre compte n’a pas les droits nécessaires pour ouvrir cette page."
        icone={ShieldAlert}
      />

      <Card>
        <CardBody className="space-y-4">
          <p className="text-base text-slate-700">
            Cette page est réservée à un autre rôle. Si vous pensez qu’il s’agit
            d’une erreur, contactez votre enseignant ou l’administration pour faire
            vérifier vos droits.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Les étudiants consultent leurs cours, leurs séances et leurs statistiques.</li>
            <li>Les enseignants gèrent leurs cours, leurs séances et les présences.</li>
            <li>Les administrateurs disposent de l’ensemble des droits.</li>
          </ul>
          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            <Link
              to="/accueil"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-app bg-brand-700 px-4 font-semibold text-white no-underline hover:bg-brand-800"
            >
              <Home aria-hidden="true" className="h-5 w-5" />
              Retour à l’accueil
            </Link>
            <Link
              to="/aide"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-app border border-slate-300 bg-white px-4 font-semibold text-slate-800 no-underline hover:bg-slate-50"
            >
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
              Consulter l’aide
            </Link>
          </div>
        </CardBody>
      </Card>
    </Page>
  );
}

export default AccesRefuse;
