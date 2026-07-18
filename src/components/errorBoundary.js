import { store } from '../app/store.js';
import { escapeHtml } from '../utils/format.js';
import { toast } from './toast.js';

let lastToastAt = 0;

const errorMessage = (error) =>
  error?.message || error?.reason?.message || 'Terjadi kesalahan tidak terduga.';

const shouldThrottleToast = () => {
  const now = Date.now();
  if (now - lastToastAt < 1800) return true;
  lastToastAt = now;
  return false;
};

export const renderAppError = ({ title = 'Halaman tidak dapat dimuat', error, retryLabel = 'Coba Lagi', onRetry } = {}) => {
  const app = document.querySelector('#app');
  if (!app) return;
  const state = store.getState();
  const requestId = error?.requestId || state.api?.lastError?.requestId || null;
  app.innerHTML = `
    <main class="grid min-h-screen place-items-center bg-slate-100 p-4 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section class="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900" role="alert" aria-live="assertive">
        <span class="badge-danger"><i data-lucide="TriangleAlert" class="size-3.5"></i>Error Runtime</span>
        <h1 class="mt-4 text-2xl font-black">${escapeHtml(title)}</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">${escapeHtml(errorMessage(error))}</p>
        ${requestId ? `<p class="mt-3 rounded-lg bg-slate-100 p-3 text-xs font-bold text-slate-600 dark:bg-slate-950 dark:text-slate-300">Request ID: ${escapeHtml(requestId)}</p>` : ''}
        <div class="mt-5 flex flex-wrap gap-3">
          <button type="button" data-error-retry class="btn-primary"><i data-lucide="RefreshCw" class="size-4"></i>${escapeHtml(retryLabel)}</button>
          <a href="#/dashboard" class="btn-secondary"><i data-lucide="LayoutDashboard" class="size-4"></i>Dashboard</a>
        </div>
      </section>
    </main>
  `;
  document.querySelector('[data-error-retry]')?.addEventListener('click', () => {
    if (onRetry) {
      onRetry();
      return;
    }
    window.dispatchEvent(new Event('hashchange'));
  });
  window.dispatchEvent(new CustomEvent('retralabs:icons'));
};

export const notifyRuntimeError = (error, fallbackMessage = 'Terjadi kesalahan pada antarmuka.') => {
  console.error('runtime-error', error);
  if (!shouldThrottleToast()) toast(error?.userMessage || fallbackMessage, 'error');
};

export const installGlobalErrorBoundary = () => {
  window.addEventListener('error', (event) => {
    notifyRuntimeError(event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    notifyRuntimeError(event.reason, 'Proses tidak dapat diselesaikan.');
  });

  window.addEventListener('offline', () => {
    store.setBackendConnection({
      reachable: false,
      checking: false,
      error: { code: 'OFFLINE', message: 'Koneksi internet terputus.', status: 0 },
    });
    toast('Mode offline aktif. Data backend dijeda sementara.', 'warning');
  });

  window.addEventListener('online', () => {
    store.setBackendConnection({ reachable: true, checking: true, error: null });
    toast('Koneksi kembali tersedia. Sinkronisasi dapat dicoba ulang.', 'info');
  });
};
