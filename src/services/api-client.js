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
    } = options;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const requestId = headers['X-Request-Id'] || getRequestId();
    if (signal) {
      if (signal.aborted) controller.abort();
      signal.addEventListener('abort', () => controller.abort(), { once: true });
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
      if (error instanceof ApiError) throw error;
      if (error?.name === 'AbortError') {
        throw new ApiError({ code: 'REQUEST_TIMEOUT', message: 'Request melebihi batas waktu.', requestId, status: 0 });
      }
      throw new ApiError({ code: 'NETWORK_ERROR', message: 'Backend tidak dapat dijangkau.', details: error?.message, requestId, status: 0 });
    }
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
