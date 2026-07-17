import { store } from '../app/store.js';
import { renderLayout } from '../components/layout.js';
import { openDocumentEditor } from '../components/documentEditor.js';
import { closeModal, openModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { downloadFile, escapeHtml, formatDateTime, slugify } from '../utils/format.js';

const statusConfig = {
  approved: ['Disetujui', 'badge-success', 'CircleCheck'],
  review: ['Dalam Review', 'badge-info', 'Clock3'],
  revision: ['Perlu Revisi', 'badge-warning', 'MessageSquareWarning'],
  draft: ['Draf', 'badge-warning', 'FileClock'],
};

const statusBadge = (status) => {
  const [label, className, icon] = statusConfig[status] || statusConfig.draft;
  return `<span class="${className}"><i data-lucide="${icon}" class="size-3.5"></i>${label}</span>`;
};

const documentActions = (id) => `
  <div class="flex justify-end gap-1">
    <button type="button" data-action="edit" data-id="${id}" class="icon-btn size-9 min-h-9 rounded-lg" title="Edit"><i data-lucide="Pencil" class="size-4"></i></button>
    <button type="button" data-action="export" data-id="${id}" class="icon-btn size-9 min-h-9 rounded-lg" title="Export Word"><i data-lucide="Download" class="size-4"></i></button>
    <button type="button" data-action="more" data-id="${id}" class="icon-btn size-9 min-h-9 rounded-lg" title="Tindakan lain"><i data-lucide="Ellipsis" class="size-4"></i></button>
  </div>
`;

const buildWordDocument = (document) => `
<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(document.title)}</title>
<style>body{font-family:Arial,sans-serif;line-height:1.6;padding:40px;color:#111}h1{font-size:24px}table{border-collapse:collapse;width:100%;margin:20px 0}td{border:1px solid #aaa;padding:8px}.label{font-weight:bold;width:180px}pre{white-space:pre-wrap;font-family:Arial,sans-serif}</style>
</head><body>
<h1>${escapeHtml(document.title)}</h1>
<table>
<tr><td class="label">Jenis Dokumen</td><td>${escapeHtml(document.type)}</td></tr>
<tr><td class="label">Mata Pelajaran</td><td>${escapeHtml(document.subject)}</td></tr>
<tr><td class="label">Kelas</td><td>${escapeHtml(document.className)}</td></tr>
<tr><td class="label">Fase</td><td>${escapeHtml(document.phase)}</td></tr>
</table>
<pre>${escapeHtml(document.content || 'Konten dokumen belum tersedia pada data demo.')}</pre>
</body></html>`;

export const renderDocuments = ({ query = new URLSearchParams() } = {}) => {
  let search = query.get('search') || '';
  let status = 'all';
  let type = 'all';

  const renderRows = () => {
    const documents = store.getState().documents.filter((document) => {
      const keyword = search.toLowerCase();
      const matchesSearch = !keyword || [document.title, document.subject, document.className, document.type].some((value) => String(value).toLowerCase().includes(keyword));
      const matchesStatus = status === 'all' || document.status === status;
      const matchesType = type === 'all' || document.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });

    const tableBody = document.querySelector('[data-document-table-body]');
    const mobileList = document.querySelector('[data-document-mobile-list]');
    const resultCount = document.querySelector('[data-result-count]');

    resultCount.textContent = `${documents.length} dokumen ditemukan`;

    tableBody.innerHTML = documents.length ? documents.map((item) => `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-[10px] font-black text-brand-700 dark:bg-brand-950 dark:text-brand-300">${item.type}</span>
            <div class="min-w-0">
              <p class="max-w-xs truncate font-black text-slate-950 dark:text-white">${escapeHtml(item.title)}</p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${escapeHtml(item.id)}</p>
            </div>
          </div>
        </td>
        <td><p class="font-bold">${escapeHtml(item.subject)}</p><p class="mt-1 text-xs text-slate-500">${escapeHtml(item.className)} · Fase ${escapeHtml(item.phase)}</p></td>
        <td>${statusBadge(item.status)}</td>
        <td>
          <div class="min-w-28">
            <div class="mb-1 flex justify-between text-xs font-bold"><span>Progress</span><span>${item.progress}%</span></div>
            <div class="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-1.5 rounded-full bg-gradient-to-r from-brand-600 to-accent-500" style="width:${item.progress}%"></div></div>
          </div>
        </td>
        <td class="whitespace-nowrap text-xs text-slate-500">${formatDateTime(item.updatedAt)}</td>
        <td>${documentActions(item.id)}</td>
      </tr>
    `).join('') : `
      <tr><td colspan="6"><div class="py-12 text-center"><i data-lucide="SearchX" class="mx-auto size-10 text-slate-400"></i><p class="mt-3 font-black">Dokumen tidak ditemukan</p><p class="mt-1 text-sm text-slate-500">Ubah kata kunci atau filter pencarian.</p></div></td></tr>
    `;

    mobileList.innerHTML = documents.length ? documents.map((item) => `
      <article class="mobile-card-row">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-[10px] font-black text-brand-700 dark:bg-brand-950 dark:text-brand-300">${item.type}</span>
            <div class="min-w-0">
              <h3 class="line-clamp-2 text-sm font-black text-slate-950 dark:text-white">${escapeHtml(item.title)}</h3>
              <p class="mt-1 text-xs text-slate-500">${escapeHtml(item.subject)} · ${escapeHtml(item.className)}</p>
            </div>
          </div>
          ${statusBadge(item.status)}
        </div>
        <div class="mt-4">
          <div class="mb-1 flex justify-between text-xs font-bold"><span>Kelengkapan</span><span>${item.progress}%</span></div>
          <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-2 rounded-full bg-gradient-to-r from-brand-600 to-accent-500" style="width:${item.progress}%"></div></div>
        </div>
        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span class="text-xs text-slate-400">${formatDateTime(item.updatedAt)}</span>
          ${documentActions(item.id)}
        </div>
      </article>
    `).join('') : `<div class="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700"><p class="font-black">Dokumen tidak ditemukan</p></div>`;

    bindActions();
    window.dispatchEvent(new CustomEvent('retralabs:icons'));
  };

  const findDocument = (id) => store.getState().documents.find((item) => item.id === id);

  const exportDocument = (item) => {
    if (!item) return;
    downloadFile(`${slugify(item.title)}.doc`, buildWordDocument(item), 'application/msword;charset=utf-8');
    toast('Dokumen Word berhasil diekspor.', 'success');
  };

  const showMoreActions = (item) => {
    openModal({
      title: 'Tindakan Dokumen',
      description: item.title,
      size: 'max-w-md',
      content: `
        <div class="grid gap-3">
          <button type="button" data-more-action="duplicate" class="btn-secondary justify-start"><i data-lucide="CopyPlus" class="size-4"></i>Duplikasi Dokumen</button>
          <button type="button" data-more-action="print" class="btn-secondary justify-start"><i data-lucide="Printer" class="size-4"></i>Print / Simpan PDF</button>
          <button type="button" data-more-action="json" class="btn-secondary justify-start"><i data-lucide="FileJson2" class="size-4"></i>Export JSON</button>
          <button type="button" data-more-action="delete" class="btn-danger justify-start"><i data-lucide="Trash2" class="size-4"></i>Hapus Dokumen</button>
        </div>
      `,
      onOpen(root) {
        root.querySelector('[data-more-action="duplicate"]').addEventListener('click', () => {
          store.addDocument({ ...item, id: `DOC-${Date.now().toString().slice(-6)}`, title: `${item.title} — Salinan`, status: 'draft', progress: Math.min(item.progress, 75), updatedAt: new Date().toISOString() });
          closeModal();
          renderRows();
          toast('Dokumen berhasil diduplikasi.', 'success');
        });
        root.querySelector('[data-more-action="print"]').addEventListener('click', () => {
          closeModal();
          setTimeout(() => window.print(), 100);
        });
        root.querySelector('[data-more-action="json"]').addEventListener('click', () => {
          downloadFile(`${slugify(item.title)}.json`, JSON.stringify(item, null, 2), 'application/json;charset=utf-8');
          toast('Data JSON berhasil diekspor.', 'success');
        });
        root.querySelector('[data-more-action="delete"]').addEventListener('click', () => {
          store.deleteDocument(item.id);
          closeModal();
          renderRows();
          toast('Dokumen dipindahkan dari daftar.', 'success');
        });
      },
    });
  };

  const bindActions = () => {
    document.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const item = findDocument(button.dataset.id);
        if (!item) return;
        if (button.dataset.action === 'edit') openDocumentEditor({ document: item });
        if (button.dataset.action === 'export') exportDocument(item);
        if (button.dataset.action === 'more') showMoreActions(item);
      });
    });
  };

  renderLayout({
    path: '/documents',
    title: 'Dokumen Perangkat Ajar',
    subtitle: 'Kelola draft, review, persetujuan, revisi, dan arsip',
    content: `
      <section class="panel">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 class="text-xl font-black text-slate-950 dark:text-white">Pusat Dokumen</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400" data-result-count>0 dokumen ditemukan</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <button type="button" data-print-list class="btn-secondary"><i data-lucide="Printer" class="size-4"></i>Print Daftar</button>
            <button type="button" data-new-document class="btn-primary"><i data-lucide="Plus" class="size-4"></i>Dokumen Baru</button>
          </div>
        </div>

        <div class="mt-6 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_200px_180px_auto]">
          <label class="relative">
            <i data-lucide="Search" class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"></i>
            <input data-document-search type="search" value="${escapeHtml(search)}" class="form-input pl-10" placeholder="Cari judul, mapel, kelas..." />
          </label>
          <select data-status-filter class="form-select">
            <option value="all">Semua Status</option>
            <option value="approved">Disetujui</option>
            <option value="review">Dalam Review</option>
            <option value="revision">Perlu Revisi</option>
            <option value="draft">Draf</option>
          </select>
          <select data-type-filter class="form-select">
            <option value="all">Semua Jenis</option>
            ${['CP', 'ACP', 'TP', 'ATP', 'PROTA', 'PROSEM', 'RPP', 'MODUL', 'KKTP'].map((item) => `<option>${item}</option>`).join('')}
          </select>
          <button type="button" data-reset-filter class="btn-secondary"><i data-lucide="RotateCcw" class="size-4"></i>Reset</button>
        </div>

        <div class="mt-6 hidden lg:block table-shell">
          <div class="overflow-x-auto">
            <table class="table-responsive">
              <thead><tr><th>Dokumen</th><th>Mata Pelajaran</th><th>Status</th><th>Progress</th><th>Diperbarui</th><th class="text-right">Aksi</th></tr></thead>
              <tbody data-document-table-body></tbody>
            </table>
          </div>
        </div>
        <div data-document-mobile-list class="mt-6 grid gap-4 lg:hidden"></div>
      </section>
    `,
  });

  document.querySelector('[data-document-search]').addEventListener('input', (event) => { search = event.target.value.trim(); renderRows(); });
  document.querySelector('[data-status-filter]').addEventListener('change', (event) => { status = event.target.value; renderRows(); });
  document.querySelector('[data-type-filter]').addEventListener('change', (event) => { type = event.target.value; renderRows(); });
  document.querySelector('[data-reset-filter]').addEventListener('click', () => {
    search = ''; status = 'all'; type = 'all';
    document.querySelector('[data-document-search]').value = '';
    document.querySelector('[data-status-filter]').value = 'all';
    document.querySelector('[data-type-filter]').value = 'all';
    renderRows();
  });
  document.querySelector('[data-new-document]').addEventListener('click', () => openDocumentEditor({ type: 'RPP' }));
  document.querySelector('[data-print-list]').addEventListener('click', () => window.print());
  const changedHandler = () => {
    if (document.querySelector('[data-document-table-body]')) renderRows();
  };
  window.addEventListener('retralabs:documents-changed', changedHandler);
  renderRows();

  return () => window.removeEventListener('retralabs:documents-changed', changedHandler);
};
