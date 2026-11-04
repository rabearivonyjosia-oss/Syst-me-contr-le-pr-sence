import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  authApi,
  clearTokens,
  getAccessToken,
  messageDepuisErreur,
} from '../services/api.js';

/**
 * Contexte d'authentification.
 * - Le rôle vient TOUJOURS du profil serveur (`/api/auth/me/`), jamais d'un
 *   décodage local du jeton.
 * - Au démarrage, la session est vérifiée avant d'afficher l'espace connecté.
 * - En cas d'expiration définitive, l'API émet `presenceqr:session-expiree` :
 *   les jetons sont effacés et l'utilisateur revient à la connexion.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [statut, setStatut] = useState(() =>
    getAccessToken() ? 'chargement' : 'deconnecte',
  );
  const [erreurSession, setErreurSession] = useState('');
  const monte = useRef(true);

  useEffect(() => {
    monte.current = true;
    return () => {
      monte.current = false;
    };
  }, []);

  const chargerProfil = useCallback(async () => {
    if (!getAccessToken()) {
      setUtilisateur(null);
      setStatut('deconnecte');
      return null;
    }

    setStatut('chargement');
    setErreurSession('');
    try {
      const profil = await authApi.me();
      if (!monte.current) return profil;
      setUtilisateur(profil);
      setStatut('connecte');
      return profil;
    } catch (erreur) {
      if (!monte.current) return null;
      if (erreur?.response?.status === 401) {
        clearTokens();
        setUtilisateur(null);
        setStatut('deconnecte');
        return null;
      }
      setErreurSession(
        messageDepuisErreur(
          erreur,
          'Impossible de vérifier votre session. Vérifiez votre connexion puis réessayez.',
        ),
      );
      setStatut('erreur');
      return null;
    }
  }, []);

  useEffect(() => {
    // Chargement initial du profil depuis l'API : synchronisation ponctuelle
    // avec un système externe, volontairement déclenchée au montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    chargerProfil();
  }, [chargerProfil]);

  useEffect(() => {
    const surExpiration = () => {
      clearTokens();
      setUtilisateur(null);
      setStatut('deconnecte');
      setErreurSession(
        'Votre session a expiré. Reconnectez-vous pour continuer.',
      );
    };
    window.addEventListener('presenceqr:session-expiree', surExpiration);
    return () =>
      window.removeEventListener('presenceqr:session-expiree', surExpiration);
  }, []);

  const connexion = useCallback(async (email, motDePasse) => {
    const donnees = await authApi.login(email, motDePasse);
    setUtilisateur(donnees.user);
    setStatut('connecte');
    setErreurSession('');
    return donnees.user;
  }, []);

  const deconnexion = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      clearTokens();
    }
    setUtilisateur(null);
    setStatut('deconnecte');
    setErreurSession('');
  }, []);

  const majUtilisateur = useCallback((profil) => {
    if (profil) setUtilisateur(profil);
  }, []);

  const role = utilisateur?.role ?? null;
  const estConnecte = statut === 'connecte' && Boolean(utilisateur);

  const valeur = useMemo(
    () => ({
      utilisateur,
      role,
      statut,
      estConnecte,
      estGestionnaire: role === 'ENSEIGNANT' || role === 'ADMIN',
      estEnseignant: role === 'ENSEIGNANT',
      estEtudiant: role === 'ETUDIANT',
      chargement: statut === 'chargement',
      erreurSession,
      connexion,
      deconnexion,
      rechargerProfil: chargerProfil,
      majUtilisateur,
    }),
    [utilisateur, role, statut, estConnecte, erreurSession, connexion, deconnexion, chargerProfil, majUtilisateur],
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>');
  }
  return contexte;
}

export default AuthContext;
