import { apiConfig, buildApiUrl } from '../config/api.js';

export class ApiError extends Error {
  constructor({
    code = 'API_ERROR',
    message = 'Request gagal.',
    details = null,
    requestId = null,
    status = 0,
    silentUnauthenticated = false,
  } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.status = status;
    this.silentUnauthenticated = silentUnauthenticated;
  }
}

let accessToken = null;
let refreshHandler = null;
let onUnauthorized = null;
let onBackendSuccess = null;
let refreshPromise = null;

const DEFAULT_MAX_RETRIES = 2;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = new Set(['NETWORK_ERROR', 'REQUEST_TIMEOUT', 'OFFLINE']);

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

export const setRefreshHandler = (handler) => {
  refreshHandler = handler;
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const setBackendSuccessHandler = (handler) => {
  onBackendSuccess = handler;
};

export const getRequestId = () =>
  globalThis.crypto?.randomUUID?.() || `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isJsonResponse = (response) => response.headers.get('content-type')?.includes('application/json');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const sanitizeFilename = (filename = 'download') =>
  String(filename)
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160) || 'download';

export const filenameFromDisposition = (header, fallback = 'download') => {
  if (!header) return sanitizeFilename(fallback);
  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return sanitizeFilename(decodeURIComponent(utfMatch[1]));
  const asciiMatch = header.match(/filename="?([^";]+)"?/i);
  return sanitizeFilename(asciiMatch?.[1] || fallback);
};

const normalizeSuccess = (payload, requestId) => {
  if (payload && typeof payload === 'object' && ('data' in payload || 'meta' in payload)) {
    return {
      data: payload.data ?? null,
      meta: payload.meta ?? null,
      requestId: payload.requestId || requestId,
    };
  }
  return { data: payload ?? null, meta: null, requestId };
};

const normalizeError = async (response, requestId) => {
  let payload = null;
  if (isJsonResponse(response)) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }
  const error = payload?.error || payload || {};
  return new ApiError({
    code: error.code || (response.status === 401 ? 'AUTHENTICATION_REQUIRED' : 'HTTP_ERROR'),
    message: error.message || 'Request backend gagal.',
    details: error.details || null,
    requestId: error.requestId || payload?.requestId || requestId || response.headers.get('x-request-id'),
    status: response.status,
  });
};

const shouldRefresh = (error) =>
  error.status === 401 && ['ACCESS_TOKEN_EXPIRED', 'AUTHENTICATION_REQUIRED'].includes(error.code);

const isRefreshRequest = (path) => String(path).replace(/\/+$/, '') === '/auth/refresh';

const canRetryRequest = ({ method, idempotencyKey }) =>
  ['GET', 'HEAD', 'OPTIONS'].includes(String(method).toUpperCase()) || Boolean(idempotencyKey);

const shouldRetry = (error, request) =>
  canRetryRequest(request) &&
  (RETRYABLE_ERROR_CODES.has(error?.code) || RETRYABLE_STATUS_CODES.has(Number(error?.status || 0)));

const retryDelay = (attempt) => Math.min(1600, 350 * (2 ** attempt)) + Math.floor(Math.random() * 120);

const refreshOnce = async () => {
  if (!refreshHandler) throw new ApiError({ code: 'REFRESH_UNAVAILABLE', status: 401 });
  if (!refreshPromise) {
    refreshPromise = Promise.resolve()
      .then(refreshHandler)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const apiClient = {
  async request(path, options = {}) {
    const {
      method = 'GET',
      body,
      query,
      headers = {},
      signal,
      timeoutMs = apiConfig.timeoutMs,
      retryOnAuth = true,
      idempotencyKey,
      responseType = 'json',
      maxRetries = DEFAULT_MAX_RETRIES,
    } = options;

    const requestId = headers['X-Request-Id'] || getRequestId();

    const execute = async (attempt = 0) => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new ApiError({ code: 'OFFLINE', message: 'Koneksi internet offline.', requestId, status: 0 });
      }

      const controller = new AbortController();
      let externalAbort = false;
      const abortFromSignal = () => {
        externalAbort = true;
        controller.abort();
      };
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      if (signal) {
        if (signal.aborted) abortFromSignal();
        else signal.addEventListener('abort', abortFromSignal, { once: true });
      }

      const requestHeaders = {
        Accept: 'application/json',
        'X-Request-Id': requestId,
        ...headers,
      };
      if (accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`;
      if (idempotencyKey) requestHeaders['Idempotency-Key'] = idempotencyKey;

      let requestBody = body;
      if (body && !(body instanceof FormData) && !(body instanceof Blob)) {
        requestHeaders['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
      }

      try {
        const response = await fetch(buildApiUrl(path, query), {
          method,
          headers: requestHeaders,
          body: requestBody,
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          const error = await normalizeError(response, requestId);
          if (retryOnAuth && !isRefreshRequest(path) && shouldRefresh(error)) {
            try {
              await refreshOnce();
              return this.request(path, { ...options, retryOnAuth: false });
            } catch (refreshError) {
              clearAccessToken();
              if (refreshError instanceof ApiError && refreshError.status === 401) {
                refreshError.silentUnauthenticated = true;
              }
              onUnauthorized?.(refreshError);
              throw refreshError;
            }
          }
          throw error;
        }

        const responseRequestId = response.headers.get('x-request-id') || requestId;
        onBackendSuccess?.({
          method,
          path,
          requestId: responseRequestId,
          status: response.status,
        });
        if (responseType === 'blob' || !isJsonResponse(response)) {
          const blob = await response.blob();
          return {
            data: blob,
            meta: {
              filename: filenameFromDisposition(response.headers.get('content-disposition')),
              contentType: response.headers.get('content-type') || blob.type,
            },
            requestId: responseRequestId,
          };
        }

        if (response.status === 204) return { data: null, meta: null, requestId: responseRequestId };
        return normalizeSuccess(await response.json(), responseRequestId);
      } catch (error) {
        clearTimeout(timeout);
        if (signal) signal.removeEventListener('abort', abortFromSignal);
        const apiError = error instanceof ApiError
          ? error
          : error?.name === 'AbortError' && externalAbort
            ? new ApiError({ code: 'REQUEST_ABORTED', message: 'Request dibatalkan.', requestId, status: 0 })
            : error?.name === 'AbortError'
              ? new ApiError({ code: 'REQUEST_TIMEOUT', message: 'Request melebihi batas waktu.', requestId, status: 0 })
              : new ApiError({ code: 'NETWORK_ERROR', message: 'Backend tidak dapat dijangkau.', details: error?.message, requestId, status: 0 });
        if (attempt < maxRetries && shouldRetry(apiError, { method, idempotencyKey })) {
          await wait(retryDelay(attempt));
          return execute(attempt + 1);
        }
        throw apiError;
      } finally {
        clearTimeout(timeout);
        if (signal) signal.removeEventListener('abort', abortFromSignal);
      }
    };

    return execute();
  },

  get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' });
  },

  post(path, body, options = {}) {
    return this.request(path, { ...options, method: 'POST', body });
  },

  patch(path, body, options = {}) {
    return this.request(path, { ...options, method: 'PATCH', body });
  },

  delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' });
  },
};
