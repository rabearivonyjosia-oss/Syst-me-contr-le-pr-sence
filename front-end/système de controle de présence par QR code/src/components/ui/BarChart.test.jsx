import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BarChart from './BarChart.jsx';

describe('BarChart', () => {
  it('affiche un état vide quand aucune donnée n’est disponible', () => {
    render(<BarChart titre="Taux par cours" donnees={[]} />);

    expect(screen.getByText('Aucune donnée')).toBeInTheDocument();
  });

  it('affiche le libellé et la valeur de chaque barre', () => {
    render(
      <BarChart
        titre="Taux de présence par cours"
        donnees={[
          { label: 'Algèbre', valeur: 75, detail: '3 présents sur 4' },
          { label: 'Physique', valeur: 50, detail: '2 présents sur 4' },
        ]}
      />,
    );

    expect(screen.getAllByText('Algèbre').length).toBeGreaterThan(0);
    expect(screen.getAllByText('75 %').length).toBeGreaterThan(0);
    expect(screen.getByText('3 présents sur 4')).toBeInTheDocument();
    expect(screen.getAllByText('Physique').length).toBeGreaterThan(0);
  });

  it('fournit un tableau alternatif accessible', () => {
    render(
      <BarChart
        titre="Taux par cours"
        libelleValeur="Taux"
        donnees={[{ label: 'Algèbre', valeur: 75 }]}
      />,
    );

    expect(
      screen.getByText('Afficher les valeurs sous forme de tableau'),
    ).toBeInTheDocument();
    const tableau = screen.getByRole('table');
    expect(within(tableau).getByRole('columnheader', { name: 'Taux' })).toBeInTheDocument();
    expect(within(tableau).getByRole('rowheader', { name: 'Algèbre' })).toBeInTheDocument();
  });

  it('borne une valeur supérieure au maximum sans dépasser 100 %', () => {
    const { container } = render(
      <BarChart titre="Taux" donnees={[{ label: 'Algèbre', valeur: 150 }]} max={100} />,
    );

    const barre = container.querySelector('figure div[aria-hidden="true"] > div');
    expect(barre).toHaveStyle({ width: '100%' });
  });
});
