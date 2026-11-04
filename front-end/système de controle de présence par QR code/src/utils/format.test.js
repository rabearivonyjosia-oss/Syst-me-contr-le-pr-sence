import { describe, expect, it } from 'vitest';
import {
  aujourdHuiIso,
  formatDate,
  formatDateHeure,
  formatDateLongue,
  formatHeure,
  formatNombre,
  formatPlage,
  formatPourcentage,
  initiales,
} from './format.js';

describe('formatage des dates et heures', () => {
  it('convertit une date ISO en date française sans décalage de fuseau', () => {
    expect(formatDate('2026-11-04')).toBe('04/11/2026');
  });

  it('laisse intacte une valeur non reconnue', () => {
    expect(formatDate('demain')).toBe('demain');
    expect(formatDate('')).toBe('—');
  });

  it('produit une date longue lisible', () => {
    expect(formatDateLongue('2026-11-04')).toBe('4 novembre 2026');
  });

  it('tronque les secondes des horaires', () => {
    expect(formatHeure('09:30:00')).toBe('09:30');
    expect(formatHeure(null)).toBe('—');
  });

  it('assemble une plage horaire', () => {
    expect(formatPlage('09:00:00', '11:00:00')).toBe('09:00 – 11:00');
  });

  it('formate un horodatage complet', () => {
    const date = new Date(2026, 10, 4, 9, 5);
    expect(formatDateHeure(date.toISOString())).toBe('04/11/2026 09:05');
  });

  it('retourne la valeur d’origine pour un horodatage invalide', () => {
    expect(formatDateHeure('pas-une-date')).toBe('pas-une-date');
  });
});

describe('formatage des nombres', () => {
  it('utilise le format français', () => {
    expect(formatNombre(12345)).toBe(new Intl.NumberFormat('fr-FR').format(12345));
  });

  it('protège contre les valeurs non numériques', () => {
    expect(formatNombre('abc')).toBe('—');
    expect(formatPourcentage(undefined)).toBe('—');
  });

  it('ajoute le symbole pourcent', () => {
    expect(formatPourcentage(42.5)).toBe(
      `${(42.5).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`,
    );
  });
});

describe('initiales', () => {
  it('prend la première lettre du prénom et du nom', () => {
    expect(initiales('Amina Diallo')).toBe('AD');
  });

  it('gère un nom unique et une valeur vide', () => {
    expect(initiales('Amina')).toBe('AM');
    expect(initiales('')).toBe('?');
  });
});

describe('aujourdHuiIso', () => {
  it('renvoie une date locale au format ISO', () => {
    expect(aujourdHuiIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
