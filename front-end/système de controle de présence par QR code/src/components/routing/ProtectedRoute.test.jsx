import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../context/AuthContext.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

const u = (surcharge = {}) => ({
  statut: 'connecte',
  role: 'ETUDIANT',
  erreurSession: '',
  rechargerProfil: vi.fn(),
  ...surcharge,
});

function rendre(element) {
  return render(
    <MemoryRouter initialEntries={['/prive']}>
      <Routes>
        <Route path="/prive" element={element} />
        <Route path="/acces-refuse" element={<p>Page accès refusé</p>} />
        <Route path="/connexion" element={<p>Page de connexion</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it('affiche un indicateur pendant la vérification de session', () => {
    vi.mocked(useAuth).mockReturnValue(u({ statut: 'chargement' }));

    rendre(
      <ProtectedRoute>
        <p>Contenu privé</p>
      </ProtectedRoute>,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Vérification de votre session',
    );
  });

  it('redirige un visiteur non connecté vers la connexion', () => {
    vi.mocked(useAuth).mockReturnValue(u({ statut: 'deconnecte', role: null }));

    rendre(
      <ProtectedRoute>
        <p>Contenu privé</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Page de connexion')).toBeInTheDocument();
  });

  it('redirige un rôle non autorisé vers la page 403', () => {
    vi.mocked(useAuth).mockReturnValue(u({ role: 'ETUDIANT' }));

    rendre(
      <ProtectedRoute roles={['ENSEIGNANT', 'ADMIN']}>
        <p>Contenu privé</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Page accès refusé')).toBeInTheDocument();
  });

  it('affiche le contenu quand le rôle est autorisé', () => {
    vi.mocked(useAuth).mockReturnValue(u({ role: 'ENSEIGNANT' }));

    rendre(
      <ProtectedRoute roles={['ENSEIGNANT', 'ADMIN']}>
        <p>Contenu privé</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Contenu privé')).toBeInTheDocument();
  });

  it('propose de réessayer quand la session ne peut pas être vérifiée', async () => {
    const utilisateur = userEvent.setup();
    const rechargerProfil = vi.fn();
    vi.mocked(useAuth).mockReturnValue(
      u({
        statut: 'erreur',
        erreurSession: 'Le serveur est injoignable.',
        rechargerProfil,
      }),
    );

    rendre(
      <ProtectedRoute>
        <p>Contenu privé</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText('Session indisponible')).toBeInTheDocument();
    await utilisateur.click(screen.getByRole('button', { name: /Réessayer/i }));
    expect(rechargerProfil).toHaveBeenCalledTimes(1);
  });
});
