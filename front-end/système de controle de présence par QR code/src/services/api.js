import axios from 'axios';

/*
 * Service API centralisé (Phase 2, frontend uniquement — backend inchangé).
 * - baseURL configurable via VITE_API_URL ; par défaut l'API tourne sur 127.0.0.1:8000
 *   en développement (même origine que les appels fetch précédents, chemins sans préfixe /api/).
 * - Injection automatique du token JWT (Authorization: Bearer <access>).
 * - Sur 401 avec un refresh token disponible : un seul renouvellement tenté,
 *   puis rejeu de la requête d'origine ; sinon déconnexion + retour à /connexion.
 * - Export urllib restant : les pages gardent leurs appels existants ; ce service
 *   standardise les nouveaux appels (profil, présences, stats…).
 */

const BASE_URL = (import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

export function setTokens({ access, refresh } = {}) {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// Évite les boucles de rafraîchissement concurrentes.
let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/token/refresh/`,
        { refresh },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const access = response.data?.access;
      if (access) localStorage.setItem('access_token', access);
      return access || null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/login/') || originalRequest?.url?.includes('/register/');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      }
      clearTokens();
      if (!window.location.pathname.startsWith('/connexion')) {
        window.location.assign('/connexion');
      }
    }
    return Promise.reject(error);
  },
);

// Message d'erreur lisible à partir d'une réponse DRF (detail ou champs).
export function messageDepuisErreur(err, messageParDefaut) {
  const data = err?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (data && typeof data === 'object') {
    const messages = Object.values(data).flat().join(' ').trim();
    if (messages) return messages;
  }
  if (!err?.response) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.';
  }
  return messageParDefaut || 'Une erreur est survenue. Veuillez réessayer.';
}

export default apiClient;
