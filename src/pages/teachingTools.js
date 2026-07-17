import { store } from '../app/store.js';
import { renderLayout } from '../components/layout.js';
import { openDocumentEditor } from '../components/documentEditor.js';
import { curriculumFlow } from '../data/demo.js';
import { escapeHtml, formatDateTime } from '../utils/format.js';
import { filterDocumentsBySchool, getActiveSchool, levelTemplateLabel } from '../utils/education.js';
import { getDocumentCode, nextActions, statusConfig } from '../utils/workflow.js';

const statusBadge = (status) => {
  const [label, className, icon] = statusConfig[status] || statusConfig.draft;
  return `<span class="${className}"><i data-lucide="${icon}" class="size-3.5"></i>${label}</span>`;
};

export const renderTeachingTools = ({ query = new URLSearchParams() } = {}) => {
  const state = store.getState();
  const activeSchool = getActiveSchool(state);
  const activeDocuments = filterDocumentsBySchool(state.documents, activeSchool.id);
  const selectedType = query.get('type');
  const typeDocuments = selectedType ? activeDocuments.filter((item) => item.type === selectedType) : activeDocuments;

  renderLayout({
    path: '/teaching-tools',
    title: 'Perangkat Ajar',
    subtitle: 'Susun dokumen secara berurutan dari CP sampai asesmen',
    content: `
      <section class="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <article class="panel overflow-hidden">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span class="badge-info"><i data-lucide="Workflow" class="size-3.5"></i>Alur Terintegrasi</span>
              <h2 class="mt-3 text-xl font-black text-slate-950 dark:text-white">Pilih perangkat yang akan dibuat</h2>
              <p class="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">${escapeHtml(levelTemplateLabel(activeSchool))}</p>
            </div>
            <button type="button" data-new-tool class="btn-primary">
              <i data-lucide="Plus" class="size-4"></i>Dokumen Baru
            </button>
          </div>

          <div class="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            ${curriculumFlow.map((item, index) => {
              const count = activeDocuments.filter((document) => document.type === item.code).length || item.count;
              return `
                <button type="button" data-tool-type="${item.code}" class="group relative overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-soft ${selectedType === item.code ? 'border-brand-500 bg-brand-50 ring-4 ring-brand-100 dark:border-brand-500 dark:bg-brand-950/30 dark:ring-brand-950' : 'border-slate-200 bg-white hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-800'}">
                  <div class="absolute -right-5 -top-5 size-20 rounded-full bg-brand-500/10 blur-2xl"></div>
                  <div class="relative flex items-start justify-between gap-3">
                    <span class="grid size-12 place-items-center rounded-2xl bg-slate-100 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-800 dark:text-brand-400">
                      <i data-lucide="${item.icon}" class="size-6"></i>
                    </span>
                    <span class="grid size-7 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">${index + 1}</span>
                  </div>
                  <p class="relative mt-4 text-lg font-black text-slate-950 dark:text-white">${item.code}</p>
                  <p class="relative mt-1 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">${item.label}</p>
                  <div class="relative mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span class="text-xs font-bold text-brand-600 dark:text-brand-400">${count} dokumen</span>
                    <span class="inline-flex items-center gap-1 text-xs font-black text-slate-700 dark:text-slate-300">Buat <i data-lucide="ArrowRight" class="size-3.5"></i></span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        </article>

        <aside class="space-y-6">
          <article class="panel bg-gradient-to-br from-brand-700 to-brand-950 text-white">
            <span class="grid size-12 place-items-center rounded-2xl bg-white/10"><i data-lucide="Sparkles" class="size-6 text-accent-400"></i></span>
            <h3 class="mt-5 text-xl font-black">AI Assistant</h3>
            <p class="mt-2 text-sm leading-6 text-brand-100">Masukkan mata pelajaran, kelas, materi, dan alokasi waktu. AI akan membuat draf yang dapat diedit.</p>
            <button type="button" data-ai-create class="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-brand-800 transition hover:bg-brand-50">
              Mulai Generate
            </button>
          </article>

          <article class="panel">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-black text-slate-950 dark:text-white">Progress Alur</h3>
              <span class="badge-success">72%</span>
            </div>
            <div class="mt-5 space-y-4">
              ${[
                ['CP -> ATP', 90],
                ['PROTA -> PROSEM', 80],
                ['RPP -> Modul', 65],
                ['KKTP -> Asesmen', 52],
              ].map(([label, value]) => `
                <div>
                  <div class="mb-1.5 flex justify-between text-xs font-bold"><span>${label}</span><span>${value}%</span></div>
                  <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-2 rounded-full bg-gradient-to-r from-brand-600 to-accent-500" style="width:${value}%"></div></div>
                </div>
              `).join('')}
            </div>
          </article>
        </aside>
      </section>

      <section class="mt-6 panel">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-black text-slate-950 dark:text-white">${selectedType ? `Dokumen ${selectedType}` : 'Dokumen Terbaru'}</h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Lanjutkan dokumen yang belum selesai atau buka hasil final.</p>
          </div>
          ${selectedType ? `<a href="#/teaching-tools" class="btn-secondary"><i data-lucide="X" class="size-4"></i>Hapus Filter</a>` : `<a href="#/documents" class="btn-secondary">Lihat Semua</a>`}
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          ${typeDocuments.slice(0, 6).map((document) => `
            <article class="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-800">
              <div class="flex items-start justify-between gap-3">
                <span class="grid size-11 place-items-center rounded-xl bg-brand-100 text-xs font-black text-brand-700 dark:bg-brand-950 dark:text-brand-300">${document.type}</span>
                ${statusBadge(document.status)}
              </div>
              <h3 class="mt-4 line-clamp-2 text-base font-black text-slate-950 dark:text-white">${escapeHtml(document.title)}</h3>
              <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(getDocumentCode(document))} - ${escapeHtml(document.subject)} - ${escapeHtml(document.className)}</p>
              <div class="mt-5">
                <div class="mb-1.5 flex justify-between text-xs font-bold"><span>Kelengkapan</span><span>${document.progress}%</span></div>
                <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-2 rounded-full bg-gradient-to-r from-brand-600 to-accent-500" style="width:${document.progress}%"></div></div>
              </div>
              <div class="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span class="text-xs text-slate-400">${formatDateTime(document.updatedAt)}</span>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  ${(nextActions[document.type] || []).slice(0, 1).map((action) => `<button type="button" data-continue-document="${document.id}" data-next-type="${action.type}" class="inline-flex items-center gap-1 text-xs font-black text-brand-600 dark:text-brand-400">${action.label}<i data-lucide="ArrowRight" class="size-3.5"></i></button>`).join('')}
                  <button type="button" data-edit-document="${document.id}" class="inline-flex items-center gap-1 text-xs font-black text-brand-600 dark:text-brand-400">Buka <i data-lucide="ArrowUpRight" class="size-3.5"></i></button>
                </div>
              </div>
            </article>
          `).join('') || `
            <div class="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <i data-lucide="FilePlus2" class="mx-auto size-10 text-slate-400"></i>
              <p class="mt-3 font-black">Belum ada dokumen ${selectedType || ''}</p>
              <p class="mt-1 text-sm text-slate-500">Buat dokumen pertama untuk memulai.</p>
            </div>
          `}
        </div>
      </section>
    `,
  });

  const openNew = (newType = selectedType || 'RPP') => openDocumentEditor({ type: newType });
  document.querySelector('[data-new-tool]')?.addEventListener('click', () => openNew());
  document.querySelector('[data-ai-create]')?.addEventListener('click', () => openNew());
  document.querySelectorAll('[data-tool-type]').forEach((button) => button.addEventListener('click', () => openNew(button.dataset.toolType)));
  document.querySelectorAll('[data-edit-document]').forEach((button) => {
    button.addEventListener('click', () => {
      const document = store.getState().documents.find((item) => item.id === button.dataset.editDocument);
      if (document) openDocumentEditor({ document });
    });
  });
  document.querySelectorAll('[data-continue-document]').forEach((button) => {
    button.addEventListener('click', () => {
      const document = store.getState().documents.find((item) => item.id === button.dataset.continueDocument);
      if (document) openDocumentEditor({ type: button.dataset.nextType, sourceDocument: document });
    });
  });
};
