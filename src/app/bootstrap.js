import { apiConfig } from '../config/api.js';
import { authService } from '../services/auth.js';
import { backendHealthService } from '../services/backend-health.js';
import { bootstrapService } from '../services/bootstrap.js';
import { ApiError, clearAccessToken, setBackendSuccessHandler, setRefreshHandler, setUnauthorizedHandler } from '../services/api-client.js';
import { store } from './store.js';

let bootstrapPromise = null;
let backendCheckPromise = null;

export const apiErrorMessages = {
  ACCOUNT_LOCKED: 'Akun terkunci. Hubungi admin sekolah.',
  INVALID_CREDENTIALS: 'Email atau kata sandi tidak sesuai.',
  SESSION_REVOKED: 'Sesi sudah dicabut. Silakan login ulang.',
  MEMBERSHIP_INACTIVE: 'Keanggotaan sekolah tidak aktif.',
  TENANT_ACCESS_DENIED: 'Akses ke sekolah ini ditolak.',
  ACTIVE_SCHOOL_REQUIRED: 'Pilih sekolah aktif untuk melanjutkan.',
  ACCESS_TOKEN_EXPIRED: 'Sesi berakhir. Silakan login ulang.',
  AUTHENTICATION_REQUIRED: 'Silakan login untuk melanjutkan.',
  DOCUMENT_REVISION_CONFLICT: 'Dokumen sudah berubah di server.',
  AI_QUOTA_EXCEEDED: 'Kuota AI tidak mencukupi.',
  AI_PROVIDER_UNAVAILABLE: 'Provider AI sedang tidak tersedia.',
  AI_REQUEST_TIMEOUT: 'Request AI melebihi batas waktu.',
  AI_INPUT_TOO_LARGE: 'Input terlalu besar untuk diproses AI.',
  FEATURE_NOT_AVAILABLE: 'Fitur belum tersedia pada paket aktif.',
  SUBSCRIPTION_REQUIRED: 'Paket berlangganan diperlukan.',
  SUBSCRIPTION_EXPIRED: 'Paket berlangganan sudah berakhir.',
  PLAN_LIMIT_EXCEEDED: 'Batas paket sudah tercapai.',
  REQUEST_TIMEOUT: 'Request backend melebihi batas waktu.',
  NETWORK_ERROR: 'Backend lokal tidak dapat dijangkau.',
  HEALTH_CHECK_FAILED: 'Health check backend gagal.',
  READY_CHECK_FAILED: 'Ready check backend gagal.',
};

export const friendlyApiMessage = (error) =>
  apiErrorMessages[error?.code] || error?.message || 'Request tidak dapat diselesaikan.';

setRefreshHandler(() => authService.refresh());
setUnauthorizedHandler((error) => {
  clearAccessToken();
  store.setAuthError(error instanceof ApiError ? error : new ApiError({ code: 'SESSION_REVOKED', status: 401 }), false);
});
setBackendSuccessHandler(({ requestId }) => {
  store.markBackendOnline({ requestId });
});

export const loadBootstrap = async ({ force = false } = {}) => {
  const state = store.getState();
  if (!force && state.auth?.status === 'authenticated' && state.api?.online) return state;
  if (!force && state.auth?.status === 'unauthenticated') return state;
  if (bootstrapPromise) return bootstrapPromise;

  store.setState({ loading: { ...state.loading, bootstrap: true } }, { persist: false });
  bootstrapPromise = bootstrapService.load()
    .then((result) => {
      store.applyBootstrap(result.data || result, result.requestId);
      return store.getState();
    })
    .catch((error) => {
      if (error.status === 401) {
        store.setAuthError(error, false);
        return store.getState();
      }
      if (error.code === 'ACTIVE_SCHOOL_REQUIRED' || error.code === 'MEMBERSHIP_INACTIVE' || error.code === 'TENANT_ACCESS_DENIED') {
        store.setAuthError(error, false);
        return store.getState();
      }
      if (apiConfig.enableLocalFallback && ['NETWORK_ERROR', 'REQUEST_TIMEOUT'].includes(error.code)) {
        store.setAuthError(error, true);
        return store.getState();
      }
      store.setAuthError(error, false);
      return store.getState();
    })
    .finally(() => {
      const current = store.getState();
      store.setState({ loading: { ...current.loading, bootstrap: false } }, { persist: false });
      bootstrapPromise = null;
    });

  return bootstrapPromise;
};

export const requireBootstrap = async () => loadBootstrap();

export const checkBackendConnection = async () => {
  if (backendCheckPromise) return backendCheckPromise;

  store.setBackendConnection({ checking: true });
  backendCheckPromise = backendHealthService.check()
    .then((result) => {
      const backendVersion = result.data?.backendVersion || result.data?.version || null;
      store.setBackendConnection({
        reachable: true,
        checking: false,
        error: null,
        requestId: result.requestId,
        backendVersion,
      });
      return true;
    })
    .catch((error) => {
      const healthError = new ApiError({
        code: error?.code === 'REQUEST_TIMEOUT' ? 'REQUEST_TIMEOUT' : 'HEALTH_CHECK_FAILED',
        message: error?.code === 'REQUEST_TIMEOUT' ? error.message : 'Health check backend gagal.',
        details: error?.details || error?.message || null,
        requestId: error?.requestId || null,
        status: error?.status || 0,
      });
      store.setBackendConnection({
        reachable: false,
        checking: false,
        error: healthError,
      });
      return false;
    })
    .finally(() => {
      backendCheckPromise = null;
    });

  return backendCheckPromise;
};
