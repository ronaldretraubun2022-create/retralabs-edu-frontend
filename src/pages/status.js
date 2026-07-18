import { appConfig } from '../config/api.js';
import { escapeHtml } from '../utils/format.js';
import { APP_VERSION } from '../utils/workflow.js';

const statusConfig = {
  offline: {
    badge: 'Mode Offline',
    icon: 'WifiOff',
    title: 'Koneksi backend tidak tersedia',
    description: 'Data lokal masih bisa dibuka bila fallback diaktifkan. Coba lagi setelah jaringan atau backend kembali stabil.',
    tone: 'text-amber-300 bg-amber-500/15',
  },
  maintenance: {
    badge: 'Maintenance',
    icon: 'Cable',
    title: 'RetraLabs Edu sedang pemeliharaan',
    description: 'Aplikasi sementara tidak menerima aktivitas baru. Tunggu sampai admin sekolah mengaktifkan kembali layanan.',
    tone: 'text-brand-300 bg-brand-500/15',
  },
  fatal: {
    badge: 'Fatal Error',
    icon: 'ShieldAlert',
    title: 'Aplikasi tidak dapat dilanjutkan',
    description: 'Terjadi error runtime yang mencegah halaman dimuat. Muat ulang halaman atau kembali ke dashboard.',
    tone: 'text-rose-300 bg-rose-500/15',
  },
};

export const renderStatusPage = ({ type = 'fatal', error = null, retry = null } = {}) => {
  const config = statusConfig[type] || statusConfig.fatal;
  const requestId = error?.requestId || null;
  document.querySelector('#app').innerHTML = `
    <main class="grid min-h-screen place-items-center bg-slate-950 p-5 text-white">
      <section class="w-full max-w-xl rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl" role="${type === 'fatal' ? 'alert' : 'status'}" aria-live="${type === 'fatal' ? 'assertive' : 'polite'}">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-slate-300">
          <i data-lucide="${config.icon}" class="size-4"></i>${escapeHtml(config.badge)}
        </span>
        <div class="mt-6 grid size-16 place-items-center rounded-2xl ${config.tone}">
          <i data-lucide="${config.icon}" class="size-8"></i>
        </div>
        <h1 class="mt-6 text-3xl font-black">${escapeHtml(config.title)}</h1>
        <p class="mt-3 text-sm leading-7 text-slate-400">${escapeHtml(error?.message || config.description)}</p>
        ${requestId ? `<p class="mt-4 rounded-lg bg-slate-950 p-3 text-xs font-bold text-slate-300">Request ID: ${escapeHtml(requestId)}</p>` : ''}
        <p class="mt-4 text-xs font-bold text-slate-500">${escapeHtml(appConfig.name)} v${APP_VERSION} / ${escapeHtml(appConfig.environment)}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <button type="button" data-status-retry class="btn-primary"><i data-lucide="RefreshCw" class="size-4"></i>Coba Lagi</button>
          <a href="#/dashboard" class="btn-secondary"><i data-lucide="LayoutDashboard" class="size-4"></i>Dashboard</a>
          <a href="#/help" class="btn-secondary"><i data-lucide="LifeBuoy" class="size-4"></i>Bantuan</a>
        </div>
      </section>
    </main>
  `;
  document.querySelector('[data-status-retry]')?.addEventListener('click', () => {
    if (retry) {
      retry();
      return;
    }
    window.dispatchEvent(new Event('hashchange'));
  });
  window.dispatchEvent(new CustomEvent('retralabs:icons'));
};

export const renderOffline = () => renderStatusPage({ type: 'offline' });
export const renderMaintenance = () => renderStatusPage({ type: 'maintenance' });
export const renderFatal = () => renderStatusPage({ type: 'fatal' });
