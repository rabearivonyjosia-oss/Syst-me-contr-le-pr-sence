import axios from 'axios';

/**
 * Service API centralisé de Présence QR.
 * - Toutes les pages passent par ce module (aucun fetch direct).
 * - Jeton d'accès injecté automatiquement ; sur 401, un seul renouvellement
 *   est tenté avec le refresh token puis la requête d'origine est rejouée.
 * - En cas d'expiration définitive, un événement `presenceqr:session-expiree`
 *   prévient l'application (message clair, retour à la connexion).
 */

const BASE_URL = (
  import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

export const CLES_JETONS = {
  access: 'access_token',
  refresh: 'refresh_token',
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

export function getAccessToken() {
  return localStorage.getItem(CLES_JETONS.access);
}

export function getRefreshToken() {
  return localStorage.getItem(CLES_JETONS.refresh);
}

export function setTokens({ access, refresh } = {}) {
  if (access) localStorage.setItem(CLES_JETONS.access, access);
  if (refresh) localStorage.setItem(CLES_JETONS.refresh, refresh);
}

export function clearTokens() {
  localStorage.removeItem(CLES_JETONS.access);
  localStorage.removeItem(CLES_JETONS.refresh);
}

function signalerSessionExpiree() {
  clearTokens();
  window.dispatchEvent(new CustomEvent('presenceqr:session-expiree'));
}

let rafraichissement = null;

async function renouvelerJeton() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  if (rafraichissement) return rafraichissement;

  rafraichissement = (async () => {
    try {
      const reponse = await axios.post(
        `${BASE_URL}/api/auth/refresh/`,
        { refresh },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const { access, refresh: nouveauRefresh } = reponse.data || {};
      if (!access) return null;
      localStorage.setItem(CLES_JETONS.access, access);
      // Rotation activée côté serveur : conserver le nouveau refresh.
      if (nouveauRefresh) localStorage.setItem(CLES_JETONS.refresh, nouveauRefresh);
      return access;
    } catch {
      return null;
    } finally {
      rafraichissement = null;
    }
  })();

  return rafraichissement;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (reponse) => reponse,
  async (erreur) => {
    const requete = erreur.config;
    const statut = erreur.response?.status;
    const url = requete?.url || '';
    const estAuthentification =
      url.includes('/api/auth/login/') ||
      url.includes('/api/auth/register/') ||
      url.includes('/api/auth/refresh/');

    if (
      statut === 401 &&
      requete &&
      !requete._nouvelleTentative &&
      !estAuthentification
    ) {
      requete._nouvelleTentative = true;
      const access = await renouvelerJeton();
      if (access) {
        requete.headers.Authorization = `Bearer ${access}`;
        return apiClient(requete);
      }
      signalerSessionExpiree();
    }

    return Promise.reject(erreur);
  },
);

// --- Aides de lecture des erreurs -----------------------------------------
export function messageDepuisErreur(erreur, messageParDefaut) {
  const donnees = erreur?.response?.data;
  if (typeof donnees?.detail === 'string' && donnees.detail.trim()) {
    return donnees.detail;
  }
  if (donnees?.errors && typeof donnees.errors === 'object') {
    const messages = Object.values(donnees.errors).flat().join(' ').trim();
    if (messages) return messages;
  }
  if (typeof donnees === 'object' && donnees !== null) {
    const messages = Object.values(donnees).flat().join(' ').trim();
    if (messages) return messages;
  }
  if (!erreur?.response) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.';
  }
  return messageParDefaut || 'Une erreur est survenue. Veuillez réessayer.';
}

export function champsDepuisErreur(erreur) {
  const donnees = erreur?.response?.data;
  const source = donnees?.errors || donnees;
  if (!source || typeof source !== 'object' || Array.isArray(source)) return {};
  return Object.fromEntries(
    Object.entries(source).map(([champ, valeur]) => [
      champ,
      Array.isArray(valeur) ? valeur.join(' ') : String(valeur),
    ]),
  );
}

export function codeDepuisErreur(erreur) {
  return erreur?.response?.data?.code || '';
}

export function estErreurReseau(erreur) {
  return !erreur?.response;
}

// --- Authentification ------------------------------------------------------
export const authApi = {
  async login(email, password) {
    const { data } = await apiClient.post('/api/auth/login/', { email, password });
    setTokens(data);
    return data;
  },
  async register(payload) {
    const { data } = await apiClient.post('/api/auth/register/', payload);
    return data;
  },
  async me() {
    const { data } = await apiClient.get('/api/auth/me/');
    return data;
  },
  async updateMe(payload) {
    const { data } = await apiClient.patch('/api/auth/me/', payload);
    return data;
  },
  async changePassword(payload) {
    const { data } = await apiClient.post('/api/auth/change-password/', payload);
    return data;
  },
  async logout() {
    try {
      await apiClient.post('/api/auth/logout/');
    } finally {
      clearTokens();
    }
  },
  async utilisateurs(role, params = {}) {
    const { data } = await apiClient.get(`/api/auth/utilisateurs/${role}/`, { params });
    return data;
  },
};

// --- Cours -----------------------------------------------------------------
export const coursApi = {
  async list(params = {}) {
    const { data } = await apiClient.get('/api/cours/', { params });
    return data;
  },
  async get(id) {
    const { data } = await apiClient.get(`/api/cours/${id}/`);
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/api/cours/', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/api/cours/${id}/`, payload);
    return data;
  },
  async remove(id) {
    await apiClient.delete(`/api/cours/${id}/`);
  },
  async etudiants(id) {
    const { data } = await apiClient.get(`/api/cours/${id}/etudiants/`);
    return data;
  },
  async etudiantsDisponibles(id, recherche = '') {
    const { data } = await apiClient.get(`/api/cours/${id}/etudiants/disponibles/`, {
      params: recherche ? { search: recherche } : {},
    });
    return data;
  },
  async inscrire(id, etudiantIds) {
    const { data } = await apiClient.post(`/api/cours/${id}/etudiants/`, {
      etudiant_ids: etudiantIds,
    });
    return data;
  },
  async desinscrire(id, etudiantIds) {
    const { data } = await apiClient.delete(`/api/cours/${id}/etudiants/`, {
      data: { etudiant_ids: etudiantIds },
    });
    return data;
  },
  async seances(id) {
    const { data } = await apiClient.get(`/api/cours/${id}/seances/`);
    return data;
  },
};

// --- Séances ---------------------------------------------------------------
export const seancesApi = {
  async list(params = {}) {
    const { data } = await apiClient.get('/api/seances/', { params });
    return data;
  },
  async get(id) {
    const { data } = await apiClient.get(`/api/seances/${id}/`);
    return data;
  },
  async create(payload) {
    const { data } = await apiClient.post('/api/seances/', payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await apiClient.patch(`/api/seances/${id}/`, payload);
    return data;
  },
  async remove(id) {
    await apiClient.delete(`/api/seances/${id}/`);
  },
  async qr(id) {
    const { data } = await apiClient.get(`/api/seances/${id}/qr/`);
    return data;
  },
  async renouvelerQr(id) {
    const { data } = await apiClient.post(`/api/seances/${id}/qr/`);
    return data;
  },
  async presences(id) {
    const { data } = await apiClient.get(`/api/seances/${id}/presences/`);
    return data;
  },
  async corrigerPresence(id, payload) {
    const { data } = await apiClient.post(`/api/seances/${id}/presences/`, payload);
    return data;
  },
};

// --- Présences -------------------------------------------------------------
export const presencesApi = {
  async scan(token) {
    const { data } = await apiClient.post('/api/presences/scan/', { token });
    return data;
  },
};

// --- Statistiques et export ------------------------------------------------
export const statsApi = {
  async get(params = {}) {
    const { data } = await apiClient.get('/api/stats/', { params });
    return data;
  },
  async exporter(params = {}) {
    const reponse = await apiClient.get('/api/exports/presences/', {
      params,
      responseType: 'blob',
    });
    const disposition = reponse.headers['content-disposition'] || '';
    const correspondance = /filename="?([^";]+)"?/i.exec(disposition);
    return {
      blob: reponse.data,
      nomFichier: correspondance?.[1] || 'presences.csv',
      nombreLignes: Number(reponse.headers['x-nombre-lignes'] || 0),
    };
  },
};

export default apiClient;
