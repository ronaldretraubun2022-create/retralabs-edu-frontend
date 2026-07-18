import { apiConfig } from '../config/api.js';
import { apiClient, clearAccessToken, setAccessToken } from './api-client.js';

const REFRESH_TOKEN_FIELD = 'refreshToken';

const tokenFrom = (result) =>
  result?.data?.tokens?.accessToken ||
  result?.data?.accessToken ||
  result?.data?.token ||
  result?.tokens?.accessToken ||
  result?.accessToken ||
  null;

let refreshCredential = null;

const refreshTokenFrom = (result) =>
  result?.data?.tokens?.refreshToken ||
  result?.data?.refreshToken ||
  result?.tokens?.refreshToken ||
  result?.refreshToken ||
  null;

const syncTokens = (result) => {
  setAccessToken(tokenFrom(result));
  refreshCredential = refreshTokenFrom(result) || refreshCredential;
};

const clearTokens = () => {
  refreshCredential = null;
  clearAccessToken();
};

export const authService = {
  async login({ email, password }) {
    const result = await apiClient.post('/auth/login', { email, password }, { retryOnAuth: false });
    syncTokens(result);
    return result;
  },

  async refresh() {
    const body = refreshCredential ? { [REFRESH_TOKEN_FIELD]: refreshCredential } : {};
    const result = await apiClient.post('/auth/refresh', body, { retryOnAuth: false });
    syncTokens(result);
    return result;
  },

  async logout() {
    try {
      return await apiClient.post('/auth/logout', refreshCredential ? { [REFRESH_TOKEN_FIELD]: refreshCredential } : {}, { retryOnAuth: false });
    } finally {
      clearTokens();
    }
  },

  async logoutAll() {
    try {
      return await apiClient.post('/auth/logout-all', {});
    } finally {
      clearTokens();
    }
  },

  me: () => apiClient.get('/auth/me'),
  schools: () => apiClient.get('/auth/schools'),
  sessions: () => apiClient.get('/auth/sessions'),
  revokeSession: (id) => apiClient.delete(`/auth/sessions/${encodeURIComponent(id)}`),

  async setActiveSchool(schoolId) {
    const result = await apiClient.patch('/auth/active-school', { schoolId });
    syncTokens(result);
    return result;
  },
};
