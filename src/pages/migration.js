import { store } from '../app/store.js';
import { renderLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';
import { downloadFile, escapeHtml } from '../utils/format.js';

export const renderMigration = () => {
  const preview = store.getLocalMigrationPreview();
  const report = store.getLocalMigrationReport();
  renderLayout({
    path: '/settings/migration',
    title: 'Migrasi LocalStorage',
    subtitle: 'Backup, preview, laporan migrasi, dan fallback lokal',
    content: `
      <section class="grid gap-6 lg:grid-cols-2">
        <article class="panel">
          <h2 class="text-xl font-black text-slate-950 dark:text-white">Preview Data Lokal</h2>
          <div class="mt-5 grid gap-3">
            <div class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p class="text-xs font-bold text-slate-500">Dokumen</p><p class="text-2xl font-black">${preview.counts.documents}</p></div>
            <div class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p class="text-xs font-bold text-slate-500">Sekolah</p><p class="text-2xl font-black">${preview.counts.schools}</p></div>
            <div class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><p class="text-xs font-bold text-slate-500">Draft Lokal</p><p class="text-2xl font-black">${preview.counts.localDraft}</p></div>
          </div>
          <div class="mt-5 flex flex-wrap gap-3">
            <button type="button" data-backup-local class="btn-primary"><i data-lucide="DatabaseBackup" class="size-4"></i>Buat Backup</button>
            <button type="button" data-download-report class="btn-secondary"><i data-lucide="FileJson2" class="size-4"></i>Unduh Laporan</button>
          </div>
        </article>
        <article class="panel">
          <h2 class="text-xl font-black text-slate-950 dark:text-white">Status Migrasi 2.0.0</h2>
          <div class="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p><span class="font-black">Marker:</span> ${escapeHtml(preview.marker?.version || 'Belum ada')}</p>
            <p><span class="font-black">Backup:</span> ${preview.hasBackup ? 'Tersedia' : 'Belum tersedia'}</p>
            <p><span class="font-black">Berhasil:</span> ${report?.succeeded?.length || 0}</p>
            <p><span class="font-black">Gagal:</span> ${report?.failed?.length || 0}</p>
            <p><span class="font-black">Storage:</span> ${preview.storageError ? escapeHtml(preview.storageError.message) : 'Normal'}</p>
          </div>
          <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            Migrasi ke backend bersifat opt-in. Data server tidak ditimpa otomatis dan fallback lokal hanya dipakai saat backend tidak tersedia.
          </div>
        </article>
      </section>
    `,
  });

  document.querySelector('[data-backup-local]').addEventListener('click', () => {
    store.backupLocalState();
    toast('Backup localStorage dibuat.', 'success');
  });
  document.querySelector('[data-download-report]').addEventListener('click', () => {
    downloadFile('retralabs-migration-2.0.0-report.json', JSON.stringify(store.getLocalMigrationReport() || store.getLocalMigrationPreview(), null, 2), 'application/json;charset=utf-8');
    toast('Laporan migrasi diunduh.', 'success');
  });
};
