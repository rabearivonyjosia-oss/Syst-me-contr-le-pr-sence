import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import DataTable from './DataTable.jsx';

const COLONNES = [
  { cle: 'nom', entete: 'Nom' },
  { cle: 'niveau', entete: 'Niveau' },
];

const LIGNES = [
  { id: 1, nom: 'Amina Diallo', niveau: 'L1' },
  { id: 2, nom: 'Benoît Martin', niveau: 'L2' },
  { id: 3, nom: 'Chloé Bernard', niveau: 'L1' },
];

function tableau() {
  return screen.getByRole('table');
}

describe('DataTable', () => {
  it('affiche les lignes et le nombre de résultats', () => {
    render(
      <DataTable
        titre="Étudiants"
        colonnes={COLONNES}
        lignes={LIGNES}
        libelleRecherche="Rechercher un étudiant"
      />,
    );

    expect(screen.getByText('3 résultats')).toBeInTheDocument();
    expect(within(tableau()).getByText('Amina Diallo')).toBeInTheDocument();
    expect(within(tableau()).getByText('Chloé Bernard')).toBeInTheDocument();
  });

  it('filtre sans tenir compte des accents ni de la casse', async () => {
    const utilisateur = userEvent.setup();
    render(
      <DataTable
        titre="Étudiants"
        colonnes={COLONNES}
        lignes={LIGNES}
        libelleRecherche="Rechercher un étudiant"
      />,
    );

    await utilisateur.type(
      screen.getByLabelText('Rechercher un étudiant'),
      'benoit',
    );

    expect(screen.getByText('1 résultat')).toBeInTheDocument();
    expect(within(tableau()).getByText('Benoît Martin')).toBeInTheDocument();
    expect(within(tableau()).queryByText('Amina Diallo')).not.toBeInTheDocument();
  });

  it('trie les lignes par colonne au clic sur l’en-tête', async () => {
    const utilisateur = userEvent.setup();
    render(
      <DataTable
        titre="Étudiants"
        colonnes={COLONNES}
        lignes={LIGNES}
        libelleRecherche="Rechercher un étudiant"
      />,
    );

    await utilisateur.click(screen.getByRole('button', { name: /Trier par Nom/ }));

    const entete = screen.getByRole('columnheader', { name: /Nom/ });
    expect(entete).toHaveAttribute('aria-sort', 'ascending');

    const lignes = within(tableau()).getAllByRole('row').slice(1);
    expect(within(lignes[0]).getByText('Amina Diallo')).toBeInTheDocument();
  });

  it('pagine les résultats et désactive les bornes', async () => {
    const utilisateur = userEvent.setup();
    render(
      <DataTable
        titre="Étudiants"
        colonnes={COLONNES}
        lignes={LIGNES}
        libelleRecherche="Rechercher un étudiant"
        parPage={2}
      />,
    );

    expect(screen.getByText(/Page 1 sur 2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page précédente' })).toBeDisabled();

    await utilisateur.click(screen.getByRole('button', { name: 'Page suivante' }));

    expect(screen.getByText(/Page 2 sur 2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page suivante' })).toBeDisabled();
    expect(within(tableau()).getByText('Chloé Bernard')).toBeInTheDocument();
  });

  it('affiche l’état vide fourni par l’appelant', () => {
    render(
      <DataTable
        titre="Étudiants"
        colonnes={COLONNES}
        lignes={[]}
        libelleRecherche="Rechercher un étudiant"
        vide={<p>Aucun étudiant inscrit.</p>}
      />,
    );

    expect(screen.getByText('Aucun étudiant inscrit.')).toBeInTheDocument();
  });
});
