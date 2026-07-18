const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const viteEnv = import.meta.env || {};

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
    url.searchParams.set(key, String(value));
  });
  return url.toString();
};
