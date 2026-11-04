import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  champsDepuisErreur,
  clearTokens,
  codeDepuisErreur,
  estErreurReseau,
  getAccessToken,
  getRefreshToken,
  messageDepuisErreur,
  setTokens,
} from './api.js';

afterEach(() => {
  clearTokens();
});

describe('gestion des jetons', () => {
  it('enregistre puis efface les jetons', () => {
    setTokens({ access: 'access-123', refresh: 'refresh-456' });

    expect(getAccessToken()).toBe('access-123');
    expect(getRefreshToken()).toBe('refresh-456');

    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('ne remplace pas un jeton existant par une valeur absente', () => {
    setTokens({ access: 'access-123', refresh: 'refresh-456' });
    setTokens({ access: 'nouveau-access' });

    expect(getAccessToken()).toBe('nouveau-access');
    expect(getRefreshToken()).toBe('refresh-456');
  });
});

describe('lecture des erreurs API', () => {
  it('privilégie le message detail et expose le code stable', () => {
    const erreur = {
      response: {
        status: 409,
        data: { detail: 'Votre présence est déjà enregistrée.', code: 'deja_present' },
      },
    };

    expect(messageDepuisErreur(erreur, 'Erreur par défaut')).toBe(
      'Votre présence est déjà enregistrée.',
    );
    expect(codeDepuisErreur(erreur)).toBe('deja_present');
    expect(estErreurReseau(erreur)).toBe(false);
  });

  it('extrait les erreurs de champ du format uniforme', () => {
    const erreur = {
      response: {
        status: 400,
        data: {
          detail: 'Les données sont invalides.',
          code: 'validation',
          errors: {
            email: ['Cette adresse est déjà utilisée.'],
            salle: 'Cette salle est occupée.',
          },
        },
      },
    };

    expect(champsDepuisErreur(erreur)).toEqual({
      email: 'Cette adresse est déjà utilisée.',
      salle: 'Cette salle est occupée.',
    });
  });

  it('accepte aussi un objet d’erreurs à plat', () => {
    const erreur = {
      response: { status: 400, data: { nom_cours: ['Ce champ est obligatoire.'] } },
    };

    expect(champsDepuisErreur(erreur)).toEqual({
      nom_cours: 'Ce champ est obligatoire.',
    });
  });

  it('détecte une absence de réponse réseau', () => {
    const erreur = new Error('Network Error');

    expect(estErreurReseau(erreur)).toBe(true);
    expect(messageDepuisErreur(erreur, 'Erreur par défaut')).toMatch(
      /Impossible de contacter le serveur/,
    );
  });

  it('retombe sur le message par défaut fourni', () => {
    const erreur = { response: { status: 500, data: {} } };
    expect(messageDepuisErreur(erreur, 'Réessayez plus tard.')).toBe(
      'Réessayez plus tard.',
    );
  });

  it('renvoie une structure vide quand aucune erreur de champ n’existe', () => {
    expect(champsDepuisErreur(undefined)).toEqual({});
    expect(codeDepuisErreur({})).toBe('');
  });

  it('ignore les valeurs non textuelles lors du message de secours', () => {
    const erreur = vi.fn();
    expect(messageDepuisErreur(erreur, 'Erreur')).toMatch(/Impossible de contacter/);
  });
});
