import { describe, expect, it } from 'vitest';
import {
  emailValide,
  motDePasseValide,
  validerCours,
  validerInscription,
  validerMotDePasse,
  validerProfil,
  validerSeance,
} from './validation.js';

describe('emailValide', () => {
  it('accepte une adresse standard', () => {
    expect(emailValide('etudiant@presence.local')).toBe(true);
  });

  it('refuse une adresse incomplète', () => {
    expect(emailValide('etudiant@')).toBe(false);
    expect(emailValide('sans-arobase.fr')).toBe(false);
  });
});

describe('motDePasseValide', () => {
  it('exige au moins huit caractères', () => {
    expect(motDePasseValide('1234567')).toBe(false);
    expect(motDePasseValide('12345678')).toBe(true);
  });
});

describe('validerCours', () => {
  it('accepte un cours complet', () => {
    expect(validerCours({ nom_cours: 'Algèbre', niveau: 'L1' })).toEqual({});
  });

  it('signale un nom trop court et un niveau absent', () => {
    const erreurs = validerCours({ nom_cours: 'A', niveau: '' });
    expect(erreurs.nom_cours).toBeDefined();
    expect(erreurs.niveau).toBeDefined();
  });
});

describe('validerSeance', () => {
  const valide = {
    cours: '1',
    date_seance: '2026-11-04',
    heure_debut: '09:00',
    heure_fin: '11:00',
    salle: 'A101',
  };

  it('accepte un créneau cohérent', () => {
    expect(validerSeance(valide)).toEqual({});
  });

  it('refuse une heure de fin antérieure au début', () => {
    const erreurs = validerSeance({ ...valide, heure_fin: '08:00' });
    expect(erreurs.heure_fin).toMatch(/postérieure/);
  });

  it('exige une salle', () => {
    expect(validerSeance({ ...valide, salle: '   ' }).salle).toBeDefined();
  });
});

describe('validerProfil', () => {
  it('exige le matricule et le niveau pour un étudiant', () => {
    const erreurs = validerProfil(
      { username: 'amina', email: 'amina@presence.local' },
      'ETUDIANT',
    );
    expect(erreurs.niveau).toBeDefined();
    expect(erreurs.num_matricule).toBeDefined();
  });

  it('ne demande pas de matricule pour un enseignant', () => {
    const erreurs = validerProfil(
      { username: 'prof', email: 'prof@presence.local' },
      'ENSEIGNANT',
    );
    expect(erreurs).toEqual({});
  });
});

describe('validerMotDePasse', () => {
  it('accepte un changement cohérent', () => {
    expect(
      validerMotDePasse({
        current_password: 'Ancien2026!',
        new_password: 'Nouveau2026!',
        confirm_password: 'Nouveau2026!',
      }),
    ).toEqual({});
  });

  it('refuse une confirmation différente et un mot de passe identique', () => {
    const erreurs = validerMotDePasse({
      current_password: 'Demo2026!',
      new_password: 'Demo2026!',
      confirm_password: 'Autre2026!',
    });
    expect(erreurs.confirm_password).toBeDefined();
    expect(erreurs.new_password).toMatch(/différent/);
  });
});

describe('validerInscription', () => {
  it('valide une inscription étudiante complète', () => {
    const erreurs = validerInscription({
      username: 'nouvel.etudiant',
      email: 'nouvel.etudiant@presence.local',
      password: 'Demo2026!',
      password_confirm: 'Demo2026!',
      niveau: 'L2',
      num_matricule: 'ETU-2026-001',
    });
    expect(erreurs).toEqual({});
  });

  it('signale une confirmation de mot de passe différente', () => {
    const erreurs = validerInscription({
      username: 'nouvel.etudiant',
      email: 'nouvel.etudiant@presence.local',
      password: 'Demo2026!',
      password_confirm: 'Autre2026!',
      niveau: 'L2',
      num_matricule: 'ETU-2026-001',
    });
    expect(erreurs.password_confirm).toBeDefined();
  });
});
