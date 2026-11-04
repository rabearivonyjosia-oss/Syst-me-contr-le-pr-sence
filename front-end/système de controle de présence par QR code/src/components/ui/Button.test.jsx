import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button.jsx';

describe('Button', () => {
  it('appelle l’action au clic', async () => {
    const utilisateur = userEvent.setup();
    const action = vi.fn();
    render(<Button onClick={action}>Enregistrer</Button>);

    await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('est désactivé et annoncé occupé pendant un chargement', () => {
    render(<Button loading>Envoi en cours</Button>);

    const bouton = screen.getByRole('button', { name: 'Envoi en cours' });
    expect(bouton).toBeDisabled();
    expect(bouton).toHaveAttribute('aria-busy', 'true');
  });

  it('est désactivé quand la propriété disabled est fournie', () => {
    render(<Button disabled>Indisponible</Button>);
    expect(screen.getByRole('button', { name: 'Indisponible' })).toBeDisabled();
  });

  it('conserve un type explicite pour les formulaires', () => {
    render(<Button type="submit">Valider</Button>);
    expect(screen.getByRole('button', { name: 'Valider' })).toHaveAttribute(
      'type',
      'submit',
    );
  });
});
