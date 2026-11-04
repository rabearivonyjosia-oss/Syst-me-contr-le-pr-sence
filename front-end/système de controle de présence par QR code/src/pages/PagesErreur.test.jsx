import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AccesRefuse from './AccesRefuse.jsx';
import NonTrouvee from './NonTrouvee.jsx';

describe('AccesRefuse', () => {
  it('explique le refus et propose un retour à l’accueil', () => {
    render(
      <MemoryRouter>
        <AccesRefuse />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Accès refusé' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Retour à l’accueil/ }),
    ).toHaveAttribute('href', '/accueil');
  });
});

describe('NonTrouvee', () => {
  it('affiche une page 404 avec les sorties utiles', () => {
    render(
      <MemoryRouter>
        <NonTrouvee />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Page introuvable' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Aller à l’accueil/ })).toHaveAttribute(
      'href',
      '/accueil',
    );
    expect(screen.getByRole('link', { name: /Se connecter/ })).toHaveAttribute(
      'href',
      '/connexion',
    );
  });
});
