const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sanitizeQueryValue = (value) =>
  String(value)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 500);

const viteEnv = import.meta.env || {};

export const appConfig = Object.freeze({
  name: viteEnv.VITE_APP_NAME || 'RetraLabs Edu',
  environment: viteEnv.VITE_APP_ENV || viteEnv.MODE || 'development',
  maintenanceMode: parseBoolean(viteEnv.VITE_MAINTENANCE_MODE, false),
  debugLogs: parseBoolean(viteEnv.VITE_ENABLE_DEBUG_LOGS, false),
});

export const apiConfig = Object.freeze({
  baseUrl: (viteEnv.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/+$/, ''),
  timeoutMs: parsePositiveInteger(viteEnv.VITE_API_TIMEOUT_MS, 30000),
  useRefreshCookie: parseBoolean(viteEnv.VITE_AUTH_REFRESH_COOKIE, true),
  enableLocalFallback: parseBoolean(viteEnv.VITE_ENABLE_LOCAL_FALLBACK, true),
});

export const buildApiUrl = (path, query = {}) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${apiConfig.baseUrl}${normalizedPath}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'limit') {
      url.searchParams.set(key, String(Math.min(Number(value) || 20, 100)));
      return;
    }
    url.searchParams.set(key, sanitizeQueryValue(value));
  });
  return url.toString();
};
