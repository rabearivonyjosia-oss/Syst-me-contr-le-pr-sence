import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Chargement de données avec les états obligatoires : chargement, erreur,
 * rechargement manuel. `charger` doit être stable (useCallback côté page).
 */
export function useRequete(charger, { immediate = true } = {}) {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(immediate);
  const [erreur, setErreur] = useState(null);
  const [version, setVersion] = useState(0);
  const chargeurRef = useRef(charger);

  useEffect(() => {
    chargeurRef.current = charger;
  }, [charger]);

  useEffect(() => {
    if (!immediate) return undefined;
    let annule = false;

    Promise.resolve()
      .then(() => chargeurRef.current())
      .then((resultat) => {
        if (!annule) {
          setDonnees(resultat);
          setErreur(null);
        }
      })
      .catch((probleme) => {
        if (!annule) setErreur(probleme);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [immediate, version]);

  const recharger = useCallback(() => {
    setChargement(true);
    setErreur(null);
    setVersion((valeur) => valeur + 1);
  }, []);

  return { donnees, chargement, erreur, recharger, setDonnees };
}

/** Appelle `callback` à intervalle régulier, en pause si l'onglet est masqué. */
export function useInterval(callback, delai) {
  const sauvegarde = useRef(callback);

  useEffect(() => {
    sauvegarde.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!delai) return undefined;
    const identifiant = window.setInterval(() => {
      if (!document.hidden) sauvegarde.current();
    }, delai);
    return () => window.clearInterval(identifiant);
  }, [delai]);
}

export function useEnLigne() {
  const [enLigne, setEnLigne] = useState(() => navigator.onLine);

  useEffect(() => {
    const surConnexion = () => setEnLigne(true);
    const surDeconnexion = () => setEnLigne(false);
    window.addEventListener('online', surConnexion);
    window.addEventListener('offline', surDeconnexion);
    return () => {
      window.removeEventListener('online', surConnexion);
      window.removeEventListener('offline', surDeconnexion);
    };
  }, []);

  return enLigne;
}
