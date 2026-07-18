import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const packageJson = JSON.parse(read('package.json'));
assert.equal(packageJson.version, '1.8.0');
assert.equal(packageJson.scripts.test, 'npm run test:phase2 && npm run test:phase3 && npm run test:phase4 && npm run test:phase5 && npm run test:phase6b');

const envExample = read('.env.example');
assert.match(envExample, /VITE_API_BASE_URL=http:\/\/localhost:3000\/api\/v1/);
assert.match(envExample, /VITE_API_TIMEOUT_MS=30000/);
assert.match(envExample, /VITE_AUTH_REFRESH_COOKIE=true/);
assert.match(envExample, /VITE_ENABLE_LOCAL_FALLBACK=true/);
assert.doesNotMatch(envExample, /SECRET|REFRESH_TOKEN|PASSWORD=/i);

globalThis.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
};

const calls = [];
let protectedCalls = 0;
const refreshField = 'refreshToken';
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url, options });
  if (String(url).endsWith('/auth/refresh')) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return new Response(JSON.stringify({ data: { accessToken: 'next-access-token', [refreshField]: 'next-refresh-token' } }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'refresh-1' },
    });
  }
  if (String(url).endsWith('/secure')) {
    protectedCalls += 1;
    if (protectedCalls <= 2) {
      return new Response(JSON.stringify({ error: { code: 'ACCESS_TOKEN_EXPIRED', message: 'expired' } }), {
        status: 401,
        headers: { 'content-type': 'application/json', 'x-request-id': 'expired-1' },
      });
    }
    return new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'ok-1' },
    });
  }
  if (String(url).endsWith('/download')) {
    return new Response(new Blob(['file']), {
      status: 200,
      headers: { 'content-type': 'application/pdf', 'content-disposition': 'attachment; filename="report.pdf"' },
    });
  }
  return new Response(JSON.stringify({ data: { ok: true } }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req-1' },
  });
};

const api = await import('../src/services/api-client.js');
const auth = await import('../src/services/auth.js');
const { store } = await import('../src/app/store.js');
const { getBackendStatus } = await import('../src/utils/backendStatus.js');
const { safeStorage, sanitizePersistedValue } = await import('../src/utils/safeStorage.js');

api.setAccessToken('access-token');
api.setRefreshHandler(() => auth.authService.refresh());

const created = await api.apiClient.post('/documents', { title: 'Tes' }, { idempotencyKey: 'idem-1' });
assert.equal(created.requestId, 'req-1');
const createCall = calls.at(-1);
assert.match(createCall.url, /\/api\/v1\/documents$/);
assert.equal(createCall.options.credentials, 'include');
assert.equal(createCall.options.headers.Authorization, 'Bearer access-token');
assert.equal(createCall.options.headers.Accept, 'application/json');
assert.equal(createCall.options.headers['Content-Type'], 'application/json');
assert.equal(createCall.options.headers['Idempotency-Key'], 'idem-1');
assert.ok(createCall.options.headers['X-Request-Id']);

await Promise.all([
  api.apiClient.get('/secure'),
  api.apiClient.get('/secure'),
]);
assert.equal(calls.filter((call) => String(call.url).endsWith('/auth/refresh')).length, 1);
assert.equal(api.getAccessToken(), 'next-access-token');

const download = await api.apiClient.get('/download', { responseType: 'blob' });
assert.equal(download.meta.filename, 'report.pdf');
assert.equal(download.data instanceof Blob, true);

let flakyCalls = 0;
globalThis.fetch = async (url) => {
  if (String(url).endsWith('/flaky')) {
    flakyCalls += 1;
    if (flakyCalls < 3) {
      return new Response(JSON.stringify({ error: { code: 'TEMPORARY_UNAVAILABLE', message: 'try again' } }), {
        status: 503,
        headers: { 'content-type': 'application/json', 'x-request-id': `flaky-${flakyCalls}` },
      });
    }
    return new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'flaky-ok' },
    });
  }
  throw new Error(`Unexpected request: ${url}`);
};
const flaky = await api.apiClient.get('/flaky');
assert.equal(flaky.data.ok, true);
assert.equal(flakyCalls, 3);

let postRetryCalls = 0;
globalThis.fetch = async (url) => {
  if (String(url).endsWith('/flaky-post')) {
    postRetryCalls += 1;
    return new Response(JSON.stringify({ error: { code: 'TEMPORARY_UNAVAILABLE', message: 'try again' } }), {
      status: 503,
      headers: { 'content-type': 'application/json', 'x-request-id': 'post-503' },
    });
  }
  throw new Error(`Unexpected request: ${url}`);
};
await assert.rejects(api.apiClient.post('/flaky-post', { ok: true }), /try again/);
assert.equal(postRetryCalls, 1);

let directRefreshCalls = 0;
globalThis.fetch = async (url) => {
  if (String(url).endsWith('/auth/refresh')) {
    directRefreshCalls += 1;
    return new Response(JSON.stringify({ error: { code: 'AUTHENTICATION_REQUIRED', message: 'refresh expired' } }), {
      status: 401,
      headers: { 'content-type': 'application/json', 'x-request-id': 'direct-refresh-401' },
    });
  }
  throw new Error(`Unexpected request: ${url}`);
};
await assert.rejects(api.apiClient.post('/auth/refresh', {}, { retryOnAuth: true }), /refresh expired/);
assert.equal(directRefreshCalls, 1);

const bootstrap = await import('../src/app/bootstrap.js');
let initialLoginRefreshCalls = 0;
globalThis.fetch = async (url) => {
  if (String(url).endsWith('/auth/refresh')) {
    initialLoginRefreshCalls += 1;
    return new Response(JSON.stringify({ error: { code: 'AUTHENTICATION_REQUIRED', message: 'login required' } }), {
      status: 401,
      headers: { 'content-type': 'application/json', 'x-request-id': 'refresh-401' },
    });
  }
  if (String(url).endsWith('/bootstrap')) {
    return new Response(JSON.stringify({ error: { code: 'AUTHENTICATION_REQUIRED', message: 'login required' } }), {
      status: 401,
      headers: { 'content-type': 'application/json', 'x-request-id': 'bootstrap-401' },
    });
  }
  return new Response(JSON.stringify({ data: { ok: true } }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'x-request-id': 'req-2' },
  });
};

api.clearAccessToken();
store.setState({
  auth: { status: 'unknown', sessionExpired: false, lastError: null },
  api: { online: false, fallbackMode: false, lastError: null, requestId: null },
}, { persist: false });
const initialLoginState = await bootstrap.loadBootstrap({ force: true });
assert.equal(initialLoginState.auth.status, 'unauthenticated');
assert.equal(initialLoginState.auth.lastError.silentUnauthenticated, true);
assert.equal(initialLoginState.api.reachable, true);
assert.equal(initialLoginRefreshCalls, 1);
await bootstrap.loadBootstrap();
assert.equal(initialLoginRefreshCalls, 1);

let recoverBootstrapCalls = 0;
let recoverRefreshCalls = 0;
globalThis.fetch = async (url) => {
  if (String(url).endsWith('/auth/refresh')) {
    recoverRefreshCalls += 1;
    return new Response(JSON.stringify({ data: { accessToken: 'bootstrap-refresh-token' } }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'recover-refresh-1' },
    });
  }
  if (String(url).endsWith('/bootstrap')) {
    recoverBootstrapCalls += 1;
    if (recoverBootstrapCalls === 1) {
      return new Response(JSON.stringify({ error: { code: 'ACCESS_TOKEN_EXPIRED', message: 'expired' } }), {
        status: 401,
        headers: { 'content-type': 'application/json', 'x-request-id': 'recover-bootstrap-401' },
      });
    }
    return new Response(JSON.stringify({
      data: {
        user: { email: 'admin@retralabs.id' },
        activeSchool: { id: 'school-smk', name: 'SMK RetraLabs', educationLevel: 'SMK' },
        permissions: ['documents.read'],
        version: '0.6.0',
      },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'recover-bootstrap-200' },
    });
  }
  throw new Error(`Unexpected request: ${url}`);
};
api.clearAccessToken();
store.setState({
  auth: { status: 'unknown', sessionExpired: false, lastError: null },
  api: { online: false, reachable: false, checking: false, fallbackMode: false, lastError: null, requestId: null },
}, { persist: false });
const recoveredBootstrapState = await bootstrap.loadBootstrap({ force: true });
assert.equal(recoverBootstrapCalls, 2);
assert.equal(recoverRefreshCalls, 1);
assert.equal(recoveredBootstrapState.auth.status, 'authenticated');
assert.equal(recoveredBootstrapState.api.online, true);
assert.equal(recoveredBootstrapState.api.reachable, true);
assert.equal(recoveredBootstrapState.api.fallbackMode, false);
assert.equal(recoveredBootstrapState.api.lastError, null);
assert.equal(recoveredBootstrapState.api.requestId, 'recover-bootstrap-200');

store.setState({
  auth: { status: 'unauthenticated', sessionExpired: false, lastError: null },
  api: { online: false, reachable: true, checking: false, fallbackMode: false, lastError: null, requestId: null },
}, { persist: false });
store.setAuthError(new api.ApiError({
  code: 'AUTHENTICATION_REQUIRED',
  message: 'login required',
  status: 401,
  requestId: 'auth-401',
}), false);
assert.equal(store.getState().api.online, false);
assert.equal(store.getState().api.reachable, true);
assert.equal(store.getState().api.fallbackMode, false);
assert.equal(getBackendStatus(store.getState()).label, 'API Aktif');

globalThis.fetch = async (url) => {
  if (String(url).endsWith('/health')) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'health failed' } }), {
      status: 500,
      headers: { 'content-type': 'application/json', 'x-request-id': 'health-500' },
    });
  }
  throw new Error(`Unexpected request: ${url}`);
};
store.setState({
  auth: { status: 'unauthenticated', sessionExpired: false, lastError: null },
  api: { online: false, reachable: true, checking: false, fallbackMode: false, lastError: null, requestId: null },
}, { persist: false });
assert.equal(await bootstrap.checkBackendConnection(), false);
assert.equal(store.getState().api.online, false);
assert.equal(store.getState().api.reachable, false);
assert.equal(store.getState().api.lastError.code, 'HEALTH_CHECK_FAILED');
assert.equal(getBackendStatus(store.getState()).label, 'Offline');

globalThis.fetch = async (url) => {
  if (String(url).endsWith('/health')) {
    return new Response(JSON.stringify({ data: { version: '0.6.0' } }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'health-1' },
    });
  }
  throw new Error(`Unexpected request: ${url}`);
};
assert.equal(await bootstrap.checkBackendConnection(), true);
assert.equal(store.getState().api.reachable, true);
assert.equal(store.getState().api.requestId, 'health-1');
assert.equal(store.getState().backendVersion, '0.6.0');

let concurrentHealthCalls = 0;
globalThis.fetch = async (url) => {
  if (String(url).endsWith('/health')) {
    concurrentHealthCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return new Response(JSON.stringify({ data: { version: '0.6.0' } }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'health-single-flight' },
    });
  }
  throw new Error(`Unexpected request: ${url}`);
};
await Promise.all([
  bootstrap.checkBackendConnection(),
  bootstrap.checkBackendConnection(),
  bootstrap.checkBackendConnection(),
]);
assert.equal(concurrentHealthCalls, 1);

store.setState({
  auth: { status: 'authenticated', sessionExpired: false, lastError: null },
  api: { online: false, reachable: false, checking: false, fallbackMode: true, lastError: null, requestId: null },
}, { persist: false });
globalThis.fetch = async (url) => {
  if (String(url).endsWith('/usage')) {
    return new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-request-id': 'usage-1' },
    });
  }
  throw new Error(`Unexpected request: ${url}`);
};
await api.apiClient.get('/usage');
assert.equal(store.getState().api.online, true);
assert.equal(store.getState().api.reachable, true);
assert.equal(store.getState().api.fallbackMode, false);
assert.equal(store.getState().api.requestId, 'usage-1');

store.applyBootstrap({ user: { email: 'admin@retralabs.id' }, activeSchool: { id: 'school-smk' } }, 'bootstrap-ok');
store.setBackendConnection({
  reachable: false,
  checking: false,
  error: new api.ApiError({ code: 'NETWORK_ERROR', message: 'late health failed' }),
});
assert.equal(store.getState().api.online, true);
assert.equal(store.getState().api.reachable, true);

const guards = await import('../src/app/guards.js');
const workflowApi = await import('../src/app/api.js');
store.setState({
  api: {
    online: false,
    reachable: true,
    checking: false,
    fallbackMode: false,
    lastError: { code: 'AUTHENTICATION_REQUIRED', status: 401 },
    requestId: 'auth-401',
  },
}, { persist: false });
await assert.rejects(
  workflowApi.documentWorkflowApi.saveDocument({ title: 'Tidak boleh lokal', type: 'RPP', subject: 'Informatika' }),
  /Backend tidak tersedia/,
);

store.setState({
  api: {
    online: false,
    reachable: false,
    checking: false,
    fallbackMode: true,
    lastError: { code: 'NETWORK_ERROR', message: 'down' },
    requestId: null,
  },
}, { persist: false });
const localFallbackDocument = await workflowApi.documentWorkflowApi.saveDocument({
  title: 'Fallback lokal',
  type: 'RPP',
  subject: 'Informatika',
  phase: 'E',
  className: 'X',
  academicYear: '2026/2027',
  semester: 'Ganjil',
});
assert.match(localFallbackDocument.id, /^DOC-/);

store.setState({
  permissions: ['documents.read', 'ai.use'],
  featureFlags: { AI_GENERATION: true },
}, { persist: false });
assert.equal(guards.canAccessRoute('/documents'), true);
assert.equal(guards.canAccessRoute('/ai'), true);
assert.equal(guards.canPerformAction('document.delete'), false);

store.setState({ auth: { status: 'authenticated' } }, { persist: false });
api.setAccessToken('memory-token');
assert.equal(localStorage.getItem('retralabs-edu-state-v1')?.includes('memory-token'), false);
assert.equal(JSON.stringify(localStorage.data).includes('next-refresh-token'), false);
assert.equal(JSON.stringify(localStorage.data).includes('refreshToken'), false);

const sanitizedStorage = sanitizePersistedValue({
  theme: 'dark',
  nested: { accessToken: 'blocked', normal: 'ok' },
  password: 'blocked',
});
assert.deepEqual(sanitizedStorage, { theme: 'dark', nested: { normal: 'ok' } });
safeStorage.setJson('safe-storage-test', sanitizedStorage);
assert.equal(localStorage.getItem('safe-storage-test').includes('blocked'), false);

const storeSource = read('src/app/store.js');
assert.match(storeSource, /MIGRATION_BACKUP_KEY/);
assert.match(storeSource, /MIGRATION_REPORT_KEY/);
assert.match(storeSource, /stripTransientState/);
assert.match(storeSource, /safeStorage/);

const routerSource = read('src/app/router.js');
assert.match(routerSource, /let started = false/);
assert.match(routerSource, /if \(started\) return this/);
assert.match(routerSource, /resolveSequence/);
assert.match(routerSource, /setErrorHandler/);

const documentsPage = read('src/pages/documents.js');
const documentEditor = read('src/components/documentEditor.js');
assert.match(documentsPage, /AbortController/);
assert.match(documentsPage, /documentService\.list/);
assert.match(documentEditor, /DOCUMENT_REVISION_CONFLICT|Konflik/i);
assert.match(documentEditor, /submitWithFormLock/);

const mainSource = read('src/main.js');
assert.match(mainSource, /installGlobalErrorBoundary/);

const apiClientSource = read('src/services/api-client.js');
assert.match(apiClientSource, /DEFAULT_MAX_RETRIES/);
assert.match(apiClientSource, /REQUEST_ABORTED/);

console.log('Phase 6B API integration tests passed.');
