import { useCallback, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChartColumn,
  Download,
  Filter,
  GraduationCap,
  Users,
} from 'lucide-react';
import Page from '../components/layout/Page.jsx';
import {
  BarChart,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  PageHeader,
  Select,
  SkeletonCarte,
  StatCard,
} from '../components/ui/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useRequete } from '../hooks/useRequete.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  codeDepuisErreur,
  coursApi,
  messageDepuisErreur,
  statsApi,
} from '../services/api.js';
import {
  formatDate,
  formatNombre,
  formatPourcentage,
} from '../utils/format.js';

const FILTRES_INITIAUX = { cours: '', date_debut: '', date_fin: '' };

function Statistiques() {
  const { estEtudiant } = useAuth();
  const { succes, info, erreur: notifierErreur } = useToast();
  const [filtres, setFiltres] = useState(FILTRES_INITIAUX);
  const [filtresAppliques, setFiltresAppliques] = useState(FILTRES_INITIAUX);
  const [erreurFiltre, setErreurFiltre] = useState('');
  const [exportEnCours, setExportEnCours] = useState(false);

  usePageTitle('Statistiques');

  const charger = useCallback(async () => {
    const parametres = {};
    if (filtresAppliques.cours) parametres.cours = filtresAppliques.cours;
    if (filtresAppliques.date_debut) parametres.date_debut = filtresAppliques.date_debut;
    if (filtresAppliques.date_fin) parametres.date_fin = filtresAppliques.date_fin;

    const [statistiques, listeCours] = await Promise.all([
      statsApi.get(parametres),
      coursApi.list({ page_size: 100 }),
    ]);
    return { statistiques, cours: listeCours.results ?? [] };
  }, [filtresAppliques]);

  const { donnees, chargement, erreur, recharger } = useRequete(charger);

  const statistiques = donnees?.statistiques;
  const cours = donnees?.cours ?? [];
  const resume = statistiques?.resume;
  const parCours = useMemo(() => statistiques?.par_cours ?? [], [statistiques]);
  const parEtudiant = useMemo(() => statistiques?.par_etudiant ?? [], [statistiques]);
  const parPeriode = useMemo(() => statistiques?.par_periode ?? [], [statistiques]);

  const modifierFiltre = (champ) => (event) => {
    setFiltres((actuels) => ({ ...actuels, [champ]: event.target.value }));
  };

  const appliquerFiltres = (event) => {
    event.preventDefault();
    if (filtres.date_debut && filtres.date_fin && filtres.date_debut > filtres.date_fin) {
      setErreurFiltre('La date de début doit précéder la date de fin.');
      return;
    }
    setErreurFiltre('');
    setFiltresAppliques(filtres);
    recharger();
  };

  const reinitialiser = () => {
    setFiltres(FILTRES_INITIAUX);
    setFiltresAppliques(FILTRES_INITIAUX);
    setErreurFiltre('');
    recharger();
  };

  const exporter = async () => {
    if (resume && resume.nb_seances === 0) {
      info('Aucune séance ne correspond à ces filtres : il n’y a rien à exporter.');
      return;
    }
    setExportEnCours(true);
    try {
      const parametres = {};
      if (filtresAppliques.cours) parametres.cours = filtresAppliques.cours;
      if (filtresAppliques.date_debut) parametres.date_debut = filtresAppliques.date_debut;
      if (filtresAppliques.date_fin) parametres.date_fin = filtresAppliques.date_fin;

      const { blob, nomFichier, nombreLignes } = await statsApi.exporter(parametres);
      const url = URL.createObjectURL(blob);
      const lien = document.createElement('a');
      lien.href = url;
      lien.download = nomFichier;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      succes(
        `Export terminé : ${formatNombre(nombreLignes)} ligne${
          nombreLignes > 1 ? 's' : ''
        } dans ${nomFichier}.`,
      );
    } catch (probleme) {
      if (codeDepuisErreur(probleme) === 'export_vide') {
        info(
          messageDepuisErreur(
            probleme,
            'Aucune présence à exporter pour ces filtres.',
          ),
        );
      } else {
        notifierErreur(
          messageDepuisErreur(
            probleme,
            'Impossible de générer l’export CSV. Réessayez dans un instant.',
          ),
        );
      }
    } finally {
      setExportEnCours(false);
    }
  };

  const donneesParCours = useMemo(
    () =>
      parCours.map((ligne) => ({
        label: ligne.cours_nom,
        valeur: ligne.taux_presence,
        detail: `${ligne.presents} présent(s) · ${ligne.nb_seances} séance(s)`,
      })),
    [parCours],
  );

  const donneesParPeriode = useMemo(
    () =>
      parPeriode.map((ligne) => ({
        label: formatDate(ligne.date),
        valeur: ligne.taux_presence,
        detail: `${ligne.presents} présent(s) · ${ligne.attendu} attendu(s)`,
      })),
    [parPeriode],
  );

  const colonnesCours = useMemo(
    () => [
      {
        cle: 'cours_nom',
        entete: 'Cours',
        rendu: (ligne) => (
          <span className="font-medium text-slate-900">{ligne.cours_nom}</span>
        ),
      },
      {
        cle: 'niveau_libelle',
        entete: 'Niveau',
        rendu: (ligne) => ligne.niveau_libelle || ligne.niveau,
      },
      { cle: 'nb_seances', entete: 'Séances' },
      { cle: 'attendu', entete: 'Attendus' },
      { cle: 'presents', entete: 'Présents' },
      { cle: 'absents', entete: 'Absents' },
      { cle: 'justifies', entete: 'Justifiés' },
      {
        cle: 'taux_presence',
        entete: 'Taux',
        rendu: (ligne) => (
          <span className="font-semibold tabular-nums">
            {formatPourcentage(ligne.taux_presence)}
          </span>
        ),
      },
    ],
    [],
  );

  const colonnesEtudiants = useMemo(
    () => [
      {
        cle: 'nom_complet',
        entete: 'Étudiant',
        rendu: (ligne) => (
          <div className="min-w-0">
            <p className="font-medium text-slate-900">
              {ligne.nom_complet || ligne.username}
            </p>
            <p className="text-sm text-slate-600">{ligne.email}</p>
          </div>
        ),
      },
      {
        cle: 'num_matricule',
        entete: 'Matricule',
        rendu: (ligne) => ligne.num_matricule || '—',
      },
      {
        cle: 'niveau_libelle',
        entete: 'Niveau',
        rendu: (ligne) => ligne.niveau_libelle || ligne.niveau || '—',
      },
      { cle: 'presents', entete: 'Présents' },
      { cle: 'absents', entete: 'Absents' },
      { cle: 'justifies', entete: 'Justifiés' },
      {
        cle: 'taux_presence',
        entete: 'Taux',
        rendu: (ligne) => (
          <span className="font-semibold tabular-nums">
            {formatPourcentage(ligne.taux_presence)}
          </span>
        ),
      },
    ],
    [],
  );

  const filtresActifs = Boolean(
    filtresAppliques.cours || filtresAppliques.date_debut || filtresAppliques.date_fin,
  );

  return (
    <Page>
      <PageHeader
        titre="Statistiques"
        description={
          estEtudiant
            ? 'Suivez votre assiduité par cours et par période.'
            : 'Analysez la présence de vos cours et exportez les données pour vos bilans.'
        }
        icone={ChartColumn}
        action={
          <Button
            variant="primary"
            onClick={exporter}
            loading={exportEnCours}
            disabled={chargement || Boolean(erreur)}
          >
            <Download aria-hidden="true" className="h-5 w-5" />
            Exporter en CSV
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Filtrer la période"
          description="Les filtres s’appliquent aux indicateurs, aux tableaux et à l’export."
        />
        <CardBody>
          <form onSubmit={appliquerFiltres} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Select
                id="stats-cours"
                label="Cours"
                value={filtres.cours}
                onChange={modifierFiltre('cours')}
              >
                <option value="">Tous les cours</option>
                {cours.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nom_cours}
                  </option>
                ))}
              </Select>
              <Input
                id="stats-date-debut"
                label="Date de début"
                type="date"
                value={filtres.date_debut}
                onChange={modifierFiltre('date_debut')}
                max={filtres.date_fin || undefined}
              />
              <Input
                id="stats-date-fin"
                label="Date de fin"
                type="date"
                value={filtres.date_fin}
                onChange={modifierFiltre('date_fin')}
                min={filtres.date_debut || undefined}
                error={erreurFiltre}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="primary">
                <Filter aria-hidden="true" className="h-5 w-5" />
                Appliquer les filtres
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={reinitialiser}
                disabled={!filtresActifs && !filtres.cours && !filtres.date_debut && !filtres.date_fin}
              >
                Réinitialiser
              </Button>
              {filtresActifs && (
                <span className="text-sm font-medium text-brand-800">
                  Filtres actifs
                </span>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      {chargement && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCarte key={index} />
            ))}
          </div>
          <SkeletonCarte className="h-64" />
          <SkeletonCarte className="h-64" />
        </>
      )}

      {!chargement && erreur && (
        <ErrorState
          titre="Impossible de charger les statistiques"
          erreur={erreur}
          onRetry={recharger}
        />
      )}

      {!chargement && !erreur && statistiques && (
        <>
          {resume.nb_seances === 0 ? (
            <EmptyState
              icon={ChartColumn}
              title="Aucune donnée sur cette période"
              description={
                filtresActifs
                  ? 'Aucune séance ne correspond aux filtres sélectionnés. Élargissez la période ou choisissez un autre cours.'
                  : 'Planifiez des séances puis enregistrez des présences pour voir apparaître les statistiques.'
              }
              action={
                filtresActifs ? (
                  <Button variant="secondary" onClick={reinitialiser}>
                    Réinitialiser les filtres
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <section aria-labelledby="stats-resume-titre" className="space-y-3">
                <h2 id="stats-resume-titre" className="sr-only">
                  Indicateurs de présence
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    titre={estEtudiant ? 'Mes cours' : 'Cours'}
                    valeur={resume.nb_cours}
                    icone={GraduationCap}
                    description={`${resume.nb_seances} séance(s) sur la période`}
                  />
                  <StatCard
                    titre="Taux de présence"
                    valeur={formatPourcentage(resume.taux_presence)}
                    icone={ChartColumn}
                    description={`${resume.presents} présent(s) sur ${resume.attendu} attendu(s)`}
                    variant="success"
                  />
                  <StatCard
                    titre="Absences"
                    valeur={resume.absents}
                    icone={CalendarDays}
                    description={`${resume.justifies} justifiée(s)`}
                    variant="danger"
                  />
                  <StatCard
                    titre={estEtudiant ? 'Séances suivies' : 'Étudiants suivis'}
                    valeur={estEtudiant ? resume.nb_seances : resume.nb_etudiants}
                    icone={Users}
                    description={
                      estEtudiant
                        ? `${resume.nb_seances_aujourdhui} aujourd’hui`
                        : `${resume.nb_seances_aujourdhui} séance(s) aujourd’hui`
                    }
                    variant="warning"
                  />
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader
                    title="Taux de présence par cours"
                    description="La valeur affichée est le taux de présence ; le détail donne le volume."
                  />
                  <CardBody>
                    <BarChart
                      titre="Taux de présence par cours"
                      donnees={donneesParCours}
                      max={100}
                      libelleValeur="Taux de présence"
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader
                    title="Évolution par période"
                    description="Chaque point correspond à une journée avec au moins une séance."
                  />
                  <CardBody>
                    <BarChart
                      titre="Taux de présence par jour"
                      donnees={donneesParPeriode}
                      max={100}
                      libelleValeur="Taux de présence"
                    />
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardHeader
                  title="Détail par cours"
                  description="Tri, recherche et pagination sont disponibles dans le tableau."
                />
                <CardBody>
                  <DataTable
                    titre="Statistiques par cours"
                    colonnes={colonnesCours}
                    lignes={parCours}
                    libelleRecherche="Rechercher un cours"
                    placeholderRecherche="Nom du cours, niveau…"
                    rechercheDans={['cours_nom', 'niveau_libelle']}
                    parPage={10}
                  />
                </CardBody>
              </Card>

              {!estEtudiant && (
                <Card>
                  <CardHeader
                    title="Détail par étudiant"
                    description="Les étudiants sont classés du taux de présence le plus élevé au plus faible."
                  />
                  <CardBody>
                    <DataTable
                      titre="Statistiques par étudiant"
                      colonnes={colonnesEtudiants}
                      lignes={parEtudiant}
                      libelleRecherche="Rechercher un étudiant"
                      placeholderRecherche="Nom, email, matricule…"
                      rechercheDans={[
                        'nom_complet',
                        'username',
                        'email',
                        'num_matricule',
                      ]}
                      parPage={10}
                    />
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardHeader title="Méthode de calcul" />
                <CardBody className="space-y-1 text-sm text-slate-700">
                  <p>
                    Le taux de présence correspond aux présences enregistrées divisées
                    par le nombre de places attendues (une par étudiant inscrit et par
                    séance de la période).
                  </p>
                  <p>
                    Une justification réduit le nombre d’absences non justifiées mais
                    n’est pas comptée comme une présence. Les données exportées
                    reprennent une ligne par étudiant et par séance.
                  </p>
                </CardBody>
              </Card>
            </>
          )}
        </>
      )}
    </Page>
  );
}

export default Statistiques;
