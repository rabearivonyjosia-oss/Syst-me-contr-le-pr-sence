import { useId, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Inbox,
  Search,
} from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import Input from './Input.jsx';

/** Normalise pour comparer sans tenir compte des accents ni de la casse. */
function normaliser(valeur) {
  return String(valeur ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Tableau de données réutilisable.
 * - Tri par colonne (aria-sort), recherche insensible aux accents et à la casse ;
 * - pagination explicite « Page x sur y » ;
 * - sur téléphone, chaque ligne devient une carte étiquetée (aucun défilement
 *   horizontal ni colonne tassée) ;
 * - état vide explicite fourni par l'appelant.
 *
 * `colonnes` : [{ cle, entete, rendu(ligne), valeur(ligne), triable, masquerMobile }]
 */
function DataTable({
  colonnes,
  lignes = [],
  cleLigne = 'id',
  titre,
  libelleRecherche = 'Rechercher',
  placeholderRecherche = 'Rechercher…',
  rechercheDans,
  parPage = 10,
  vide,
  className = '',
}) {
  const idRecherche = useId();
  const [recherche, setRecherche] = useState('');
  const [tri, setTri] = useState(null); // { cle, sens: 'asc' | 'desc' }
  const [page, setPage] = useState(1);

  const champsRecherche = useMemo(
    () => rechercheDans ?? colonnes.map((colonne) => colonne.cle),
    [rechercheDans, colonnes],
  );

  const valeurDe = (colonne, ligne) =>
    colonne.valeur ? colonne.valeur(ligne) : ligne[colonne.cle];

  const lignesFiltrees = useMemo(() => {
    const terme = normaliser(recherche);
    if (!terme) return lignes;
    return lignes.filter((ligne) =>
      champsRecherche.some((champ) => {
        const colonne = colonnes.find((item) => item.cle === champ);
        const valeur = colonne ? valeurDe(colonne, ligne) : ligne[champ];
        return normaliser(valeur).includes(terme);
      }),
    );
  }, [lignes, recherche, champsRecherche, colonnes]);

  const lignesTriees = useMemo(() => {
    if (!tri) return lignesFiltrees;
    const colonne = colonnes.find((item) => item.cle === tri.cle);
    if (!colonne) return lignesFiltrees;
    const facteur = tri.sens === 'asc' ? 1 : -1;
    return [...lignesFiltrees].sort((a, b) => {
      const valeurA = valeurDe(colonne, a);
      const valeurB = valeurDe(colonne, b);
      if (typeof valeurA === 'number' && typeof valeurB === 'number') {
        return (valeurA - valeurB) * facteur;
      }
      return (
        String(valeurA ?? '').localeCompare(String(valeurB ?? ''), 'fr', {
          numeric: true,
          sensitivity: 'base',
        }) * facteur
      );
    });
  }, [lignesFiltrees, tri, colonnes]);

  const totalPages = Math.max(1, Math.ceil(lignesTriees.length / parPage));
  const pageCourante = Math.min(page, totalPages);
  const debut = (pageCourante - 1) * parPage;
  const lignesPage = lignesTriees.slice(debut, debut + parPage);

  const basculerTri = (cle) => {
    setPage(1);
    setTri((actuel) => {
      if (!actuel || actuel.cle !== cle) return { cle, sens: 'asc' };
      if (actuel.sens === 'asc') return { cle, sens: 'desc' };
      return null;
    });
  };

  const ariaSort = (cle) => {
    if (!tri || tri.cle !== cle) return 'none';
    return tri.sens === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <Input
            id={idRecherche}
            label={libelleRecherche}
            placeholder={placeholderRecherche}
            value={recherche}
            onChange={(event) => {
              setRecherche(event.target.value);
              setPage(1);
            }}
            leadingIcon={Search}
            type="search"
          />
        </div>
        <p className="text-sm text-slate-600" role="status">
          {lignesTriees.length === 0
            ? 'Aucun résultat'
            : `${lignesTriees.length} résultat${lignesTriees.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {lignesTriees.length === 0 ? (
        vide ?? (
          <EmptyState
            icon={Inbox}
            title="Aucun résultat"
            description={
              recherche
                ? 'Aucun élément ne correspond à votre recherche. Modifiez les mots-clés.'
                : 'Aucune donnée à afficher pour le moment.'
            }
          />
        )
      ) : (
        <>
          {/* --- Bureau : tableau trié ------------------------------------ */}
          <div className="hidden overflow-x-auto rounded-app border border-slate-200 bg-white shadow-card md:block">
            <table className="w-full border-collapse text-left text-base text-slate-800">
              {titre && <caption className="sr-only">{titre}</caption>}
              <thead className="border-b border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                <tr>
                  {colonnes.map((colonne) => (
                    <th
                      key={colonne.cle}
                      scope="col"
                      aria-sort={colonne.triable === false ? undefined : ariaSort(colonne.cle)}
                      className={`px-4 py-3 font-semibold ${colonne.classe ?? ''}`}
                    >
                      {colonne.triable === false ? (
                        colonne.entete
                      ) : (
                        <button
                          type="button"
                          onClick={() => basculerTri(colonne.cle)}
                          className="inline-flex items-center gap-1.5 rounded font-semibold hover:text-brand-800"
                        >
                          <span>{colonne.entete}</span>
                          {tri?.cle === colonne.cle ? (
                            tri.sens === 'asc' ? (
                              <ArrowUp aria-hidden="true" className="h-4 w-4" />
                            ) : (
                              <ArrowDown aria-hidden="true" className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronsUpDown
                              aria-hidden="true"
                              className="h-4 w-4 text-slate-400"
                            />
                          )}
                          <span className="sr-only">
                            {tri?.cle === colonne.cle
                              ? `Trier par ${colonne.entete} en ordre ${
                                  tri.sens === 'asc' ? 'décroissant' : 'croissant'
                                }`
                              : `Trier par ${colonne.entete}`}
                          </span>
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lignesPage.map((ligne) => (
                  <tr
                    key={ligne[cleLigne]}
                    className="odd:bg-white even:bg-slate-50/70 hover:bg-brand-50/60"
                  >
                    {colonnes.map((colonne) => (
                      <td
                        key={colonne.cle}
                        className={`px-4 py-3 align-middle tabular-nums ${
                          colonne.classeCellule ?? ''
                        }`}
                      >
                        {colonne.rendu ? colonne.rendu(ligne) : ligne[colonne.cle]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- Téléphone : cartes étiquetées ---------------------------- */}
          <ul className="space-y-3 md:hidden">
            {lignesPage.map((ligne) => (
              <li
                key={ligne[cleLigne]}
                className="rounded-app border border-slate-200 bg-white p-4 shadow-card"
              >
                <dl className="space-y-2">
                  {colonnes
                    .filter((colonne) => !colonne.masquerMobile)
                    .map((colonne) => (
                      <div
                        key={colonne.cle}
                        className="flex items-start justify-between gap-3"
                      >
                        <dt className="text-sm font-semibold text-slate-500">
                          {colonne.entete}
                        </dt>
                        <dd className="min-w-0 text-right text-base text-slate-900">
                          {colonne.rendu ? colonne.rendu(ligne) : ligne[colonne.cle]}
                        </dd>
                      </div>
                    ))}
                </dl>
              </li>
            ))}
          </ul>

          {/* --- Pagination ---------------------------------------------- */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Page {pageCourante} sur {totalPages}
              <span className="text-slate-500">
                {' '}
                · éléments {debut + 1} à {Math.min(debut + parPage, lignesTriees.length)}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(pageCourante - 1)}
                disabled={pageCourante <= 1}
                aria-label="Page précédente"
                className="inline-flex h-11 items-center gap-1 rounded-app border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-card hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                Précédent
              </button>
              <button
                type="button"
                onClick={() => setPage(pageCourante + 1)}
                disabled={pageCourante >= totalPages}
                aria-label="Page suivante"
                className="inline-flex h-11 items-center gap-1 rounded-app border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-card hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                Suivant
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DataTable;
