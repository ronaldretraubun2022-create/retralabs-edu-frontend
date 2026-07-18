import { friendlyApiMessage } from '../app/bootstrap.js';
import { store } from '../app/store.js';
import { unwrapList } from '../app/backend-mappers.js';
import { renderLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';
import { authService } from '../services/auth.js';
import { bindAsyncClick, runWithButtonLock } from '../utils/asyncAction.js';
import { escapeHtml, formatDateTime } from '../utils/format.js';
import { emptyState } from '../utils/productionUi.js';

export const renderSessions = () => {
  renderLayout({
    path: '/settings/sessions',
    title: 'Sesi Aktif',
    subtitle: 'Perangkat login dan logout semua perangkat',
    content: `
      <section class="panel">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 class="text-xl font-black text-slate-950 dark:text-white">Session Aktif</h2><p class="mt-1 text-sm text-slate-500" data-session-meta>Memuat...</p></div>
          <button type="button" data-logout-all class="btn-danger"><i data-lucide="LogOut" class="size-4"></i>Logout Semua Perangkat</button>
        </div>
        <div data-session-list class="mt-6 grid gap-3"></div>
      </section>
    `,
  });

  const load = async () => {
    const target = document.querySelector('[data-session-list]');
    try {
      const result = await authService.sessions();
      const items = unwrapList(result);
      document.querySelector('[data-session-meta]').textContent = `${items.length} sesi`;
      target.innerHTML = items.length ? items.map((item) => `
        <article class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p class="font-black">${escapeHtml(item.device || item.userAgent || 'Perangkat')}</p><p class="mt-1 text-xs text-slate-500">${escapeHtml(formatDateTime(item.lastUsedAt || item.createdAt))}</p></div>
            <button type="button" data-revoke-session="${escapeHtml(item.id)}" class="btn-secondary"><i data-lucide="Trash2" class="size-4"></i>Cabut</button>
          </div>
        </article>
      `).join('') : emptyState({ title: 'Tidak ada sesi aktif', description: 'Backend tidak mengirim sesi aktif.' });
      target.querySelectorAll('[data-revoke-session]').forEach((button) => button.addEventListener('click', async () => {
        await runWithButtonLock(button, async () => {
          await authService.revokeSession(button.dataset.revokeSession);
          toast('Sesi dicabut.', 'success');
          load();
        });
      }));
    } catch (error) {
      target.innerHTML = emptyState({ title: friendlyApiMessage(error), description: error.requestId ? `Request ID: ${error.requestId}` : 'Coba refresh halaman.' });
    }
    window.dispatchEvent(new CustomEvent('retralabs:icons'));
  };

  bindAsyncClick(document.querySelector('[data-logout-all]'), async () => {
    await authService.logoutAll().catch(() => null);
    store.clearSession();
    toast('Logout semua perangkat diproses.', 'success');
    window.location.hash = '/login';
  });
  load();
};
