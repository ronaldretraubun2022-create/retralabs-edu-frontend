import { store } from '../app/store.js';
import { friendlyApiMessage } from '../app/bootstrap.js';
import { unwrapList } from '../app/backend-mappers.js';
import { renderLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';
import { notificationService } from '../services/domain-services.js';
import { bindAsyncClick, runWithButtonLock } from '../utils/asyncAction.js';
import { escapeHtml, formatDateTime } from '../utils/format.js';
import { emptyState } from '../utils/productionUi.js';

export const renderNotifications = () => {
  renderLayout({
    path: '/notifications',
    title: 'Notifikasi',
    subtitle: 'Notifikasi internal sesuai user dan sekolah aktif',
    content: `
      <section class="panel">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-black text-slate-950 dark:text-white">Inbox Notifikasi</h2>
            <p class="mt-1 text-sm text-slate-500" data-notification-meta>Memuat...</p>
          </div>
          <button type="button" data-read-all class="btn-secondary"><i data-lucide="CircleCheck" class="size-4"></i>Tandai Semua Dibaca</button>
        </div>
        <div data-notification-list class="mt-6 grid gap-3"></div>
      </section>
    `,
  });

  const load = async () => {
    const target = document.querySelector('[data-notification-list]');
    const meta = document.querySelector('[data-notification-meta]');
    target.innerHTML = '<div class="rounded-2xl border border-slate-200 p-5 text-sm font-bold text-slate-500 dark:border-slate-800">Memuat...</div>';
    try {
      const result = await notificationService.list({ page: 1, limit: 50 });
      const items = unwrapList(result);
      meta.textContent = `${items.length} notifikasi`;
      target.innerHTML = items.length ? items.map((item) => `
        <article class="rounded-2xl border ${item.isRead ? 'border-slate-200 dark:border-slate-800' : 'border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/20'} p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="font-black text-slate-950 dark:text-white">${escapeHtml(item.title || item.type || 'Notifikasi')}</p>
              <p class="mt-1 text-sm text-slate-500">${escapeHtml(item.body || item.message || '')}</p>
              <p class="mt-2 text-xs font-semibold text-slate-400">${escapeHtml(formatDateTime(item.createdAt || item.updatedAt))}</p>
            </div>
            <button type="button" data-mark-read="${escapeHtml(item.id)}" class="btn-secondary ${item.isRead ? 'hidden' : ''}"><i data-lucide="CircleCheck" class="size-4"></i>Dibaca</button>
          </div>
        </article>
      `).join('') : emptyState({ title: 'Tidak ada notifikasi', description: 'Notifikasi user atau sekolah lain tidak ditampilkan.' });
      target.querySelectorAll('[data-mark-read]').forEach((button) => button.addEventListener('click', async () => {
        await runWithButtonLock(button, async () => {
          await notificationService.markRead(button.dataset.markRead);
          const unread = Math.max(Number(store.getState().notifications?.unreadCount || 0) - 1, 0);
          store.setState({ notifications: { unreadCount: unread } }, { persist: false });
          load();
        });
      }));
    } catch (error) {
      meta.textContent = error.requestId ? `Request ID: ${error.requestId}` : 'Request gagal';
      target.innerHTML = emptyState({ title: friendlyApiMessage(error), description: error.requestId ? `Request ID: ${error.requestId}` : 'Coba lagi.' });
    }
    window.dispatchEvent(new CustomEvent('retralabs:icons'));
  };

  bindAsyncClick(document.querySelector('[data-read-all]'), async () => {
    try {
      await notificationService.readAll();
      store.setState({ notifications: { unreadCount: 0 } }, { persist: false });
      toast('Semua notifikasi ditandai dibaca.', 'success');
      load();
    } catch (error) {
      toast(friendlyApiMessage(error), 'error');
    }
  });
  load();
};
