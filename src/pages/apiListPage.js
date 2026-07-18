import { friendlyApiMessage } from '../app/bootstrap.js';
import { unwrapList, unwrapMeta } from '../app/backend-mappers.js';
import { renderLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';
import { escapeHtml, formatDateTime } from '../utils/format.js';
import { emptyState } from '../utils/productionUi.js';

const valueFor = (item, field) => {
  const value = field.split('.').reduce((target, key) => target?.[key], item);
  if (value === undefined || value === null || value === '') return '-';
  if (field.toLowerCase().includes('amount') || field.toLowerCase().includes('price')) return String(value);
  if (field.toLowerCase().includes('date') || field.toLowerCase().includes('at')) return formatDateTime(value);
  return String(value);
};

export const renderApiListPage = ({ path, title, subtitle, service, columns, emptyTitle, query = {} }) => {
  renderLayout({
    path,
    title,
    subtitle,
    content: `
      <section class="panel">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-xl font-black text-slate-950 dark:text-white">${escapeHtml(title)}</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400" data-api-list-meta>Memuat data...</p>
          </div>
          <button type="button" data-api-list-refresh class="btn-secondary"><i data-lucide="RefreshCw" class="size-4"></i>Refresh</button>
        </div>
        <div class="mt-6 table-shell">
          <div class="overflow-x-auto">
            <table class="table-responsive">
              <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr></thead>
              <tbody data-api-list-body><tr><td colspan="${columns.length}"><div class="p-6 text-sm font-bold text-slate-500">Memuat...</div></td></tr></tbody>
            </table>
          </div>
        </div>
      </section>
    `,
  });

  const load = async () => {
    const body = document.querySelector('[data-api-list-body]');
    const metaTarget = document.querySelector('[data-api-list-meta]');
    body.innerHTML = `<tr><td colspan="${columns.length}"><div class="p-6 text-sm font-bold text-slate-500">Memuat...</div></td></tr>`;
    try {
      const result = await service({ page: 1, limit: 50, ...query });
      const items = unwrapList(result);
      const meta = unwrapMeta(result);
      metaTarget.textContent = `${meta.total || items.length} data - halaman ${meta.page}/${meta.totalPages}`;
      body.innerHTML = items.length ? items.map((item) => `
        <tr>${columns.map((column) => `<td>${escapeHtml(valueFor(item, column.field))}</td>`).join('')}</tr>
      `).join('') : `<tr><td colspan="${columns.length}">${emptyState({ title: emptyTitle, description: 'Belum ada data dari backend untuk filter ini.' })}</td></tr>`;
    } catch (error) {
      metaTarget.textContent = error.requestId ? `Request ID: ${error.requestId}` : 'Request gagal';
      body.innerHTML = `<tr><td colspan="${columns.length}">${emptyState({ title: friendlyApiMessage(error), description: error.requestId ? `Request ID: ${error.requestId}` : 'Gunakan tombol refresh untuk mencoba ulang.' })}</td></tr>`;
      toast(friendlyApiMessage(error), 'error');
    }
    window.dispatchEvent(new CustomEvent('retralabs:icons'));
  };

  document.querySelector('[data-api-list-refresh]').addEventListener('click', load);
  load();
};
