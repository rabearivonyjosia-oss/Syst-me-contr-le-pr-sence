import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import apiClient, { clearTokens, getAccessToken, setTokens } from '../services/api.js';

/*
 * Contexte d'authentification (Phase 2).
 * - Source de vérité côté client : présence du token d'accès + profil courant.
 * - Le backend actuel n'expose pas d'endpoint de profil (/api/profile/ absent avant
 *   Phase 1 backend, non corrigée ici) : on extrait le rôle depuis le JWT pour
 *   les redirections, et fetchProfile() reste prêt à basculer sur l'API dès qu'elle
 *   existe (rôle explicite renvoyé par le serveur).
 */

const AuthContext = createContext(null);

function decodageJwt(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function roleDepuisToken(token, profilActuel) {
  if (profilActuel?.role) return profilActuel.role;
  const payload = decodageJwt(token);
  const role = payload?.role ?? payload?.user_role ?? '';
  const roleNormalise = String(role).toUpperCase();
  if (roleNormalise === 'ENSEIGNANT') return 'ENSEIGNANT';
  if (roleNormalise === 'ETUDIANT') return 'ETUDIANT';
  // Sans profil ni rôle dans le JWT (cas du backend actuel), un utilisateur
  // authentifié est traité comme enseignant par défaut pour préserver
  // l'espace existant ; basculera automatiquement dès que /api/profile/ répond.
  return token ? 'ENSEIGNANT' : null;
}

export function AuthProvider({ children }) {
  const [profil, setProfil] = useState(null);
  const [chargementProfil, setChargementProfil] = useState(false);

  // RÔLE_EFFECTIF : profil serveur s'il existe, sinon JWT / défaut ci-dessus.
  const token = getAccessToken();
  const role = roleDepuisToken(token, profil);

  const connexion = useCallback((data) => {
    setTokens({ access: data?.access, refresh: data?.refresh });
    if (data?.profil || data?.user) setProfil(data.profil || data.user);
  }, []);

  const deconnexion = useCallback(() => {
    clearTokens();
    setProfil(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!getAccessToken()) return null;
    setChargementProfil(true);
    try {
      // Endpoint cible : GET /api/profile/. En attendant sa disponibilité
      // (backend non corrigé), on échoue silencieusement et on reste sur
      // le rôle déduit du token.
      const reponse = await apiClient.get('/api/profile/');
      setProfil(reponse.data);
      return reponse.data;
    } catch {
      return null;
    } finally {
      setChargementProfil(false);
    }
  }, []);

  useEffect(() => {
    // Chargement silencieux au montage : ne bloque jamais l'interface si l'API
    // de profil est indisponible (backend actuel).
    if (token) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      utilisateur: profil,
      profil,
      role,
      estConnecte: Boolean(token),
      estEnseignant: role === 'ENSEIGNANT',
      estEtudiant: role === 'ETUDIANT',
      chargementProfil,
      connexion,
      deconnexion,
      fetchProfile,
      setProfil,
    }),
    [profil, role, token, chargementProfil, connexion, deconnexion, fetchProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>');
  }
  return contexte;
}

export default AuthContext;
