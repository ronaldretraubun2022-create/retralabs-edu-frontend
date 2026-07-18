import { apiConfig } from '../config/api.js';
import { escapeHtml } from './format.js';

const offlineErrorCodes = new Set([
  'NETWORK_ERROR',
  'REQUEST_TIMEOUT',
  'BACKEND_UNREACHABLE',
  'HEALTH_CHECK_FAILED',
  'READY_CHECK_FAILED',
]);

const isConnectivityError = (error) => offlineErrorCodes.has(error?.code);

export const isBackendReachableError = (error) =>
  Boolean(error?.status && !isConnectivityError(error));

export const canUseLocalFallback = (state = {}) => {
  const api = state.api || {};
  return (
    apiConfig.enableLocalFallback &&
    api.online !== true &&
    api.reachable !== true &&
    api.fallbackMode === true &&
    isConnectivityError(api.lastError)
  );
};

export const getBackendStatus = (state = {}) => {
  const api = state.api || {};
  const baseUrl = apiConfig.baseUrl;

  if (api.online) {
    return {
      label: 'Online',
      shortLabel: 'Online',
      icon: 'Wifi',
      badgeClass: 'badge-success',
      title: `Backend aktif di ${baseUrl}`,
      description: 'Session dan bootstrap backend aktif.',
    };
  }

  if (api.checking) {
    return {
      label: 'Mengecek API',
      shortLabel: 'Cek API',
      icon: 'RefreshCw',
      badgeClass: 'badge-info',
      title: `Mengecek koneksi ${baseUrl}`,
      description: 'Memeriksa status backend RetraLabs Edu.',
    };
  }

  if (api.reachable) {
    return {
      label: 'API Aktif',
      shortLabel: 'API Aktif',
      icon: 'Cable',
      badgeClass: 'badge-info',
      title: `Backend dapat dijangkau di ${baseUrl}`,
      description: 'Backend aktif. Login diperlukan untuk memuat workspace.',
    };
  }

  if (api.fallbackMode) {
    return {
      label: 'Offline',
      shortLabel: 'Offline',
      icon: 'WifiOff',
      badgeClass: 'badge-warning',
      title: `Backend tidak terjangkau di ${baseUrl}`,
      description: 'Fallback lokal aktif karena backend tidak tersedia.',
    };
  }

  if (isConnectivityError(api.lastError)) {
    return {
      label: 'Offline',
      shortLabel: 'Offline',
      icon: 'WifiOff',
      badgeClass: 'badge-warning',
      title: `Backend tidak terjangkau di ${baseUrl}`,
      description: 'Nyalakan backend lokal lalu coba ulang.',
    };
  }

  return {
    label: 'Menunggu API',
    shortLabel: 'API',
    icon: 'Cable',
    badgeClass: 'badge-info',
    title: `Menunggu koneksi ${baseUrl}`,
    description: 'Status backend belum diperiksa.',
  };
};

export const backendStatusBadge = (state = {}) => {
  const status = getBackendStatus(state);
  return `<span class="${status.badgeClass}" title="${escapeHtml(status.title)}"><i data-lucide="${status.icon}" class="size-3.5"></i>${escapeHtml(status.label)}</span>`;
};

export const backendStatusLoginCard = (state = {}) => {
  const status = getBackendStatus(state);
  return `
    <div class="flex items-start gap-3">
      <span class="${status.badgeClass} shrink-0"><i data-lucide="${status.icon}" class="size-3.5"></i>${escapeHtml(status.shortLabel)}</span>
      <div class="min-w-0">
        <p class="font-black">Backend</p>
        <p class="mt-1 break-words text-slate-500">${escapeHtml(status.description)}</p>
        <p class="mt-2 break-all font-mono text-[11px] text-slate-400">${escapeHtml(apiConfig.baseUrl)}</p>
      </div>
    </div>
  `;
};
