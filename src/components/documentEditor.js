import { mockApi } from '../app/api.js';
import { store } from '../app/store.js';
import { classes, subjects } from '../data/demo.js';
import { escapeHtml } from '../utils/format.js';
import { minLength, renderErrors, required, validateForm } from '../utils/validators.js';
import { hideLoading, showLoading } from './loading.js';
import { closeModal, openModal } from './modal.js';
import { toast } from './toast.js';

const documentTypes = ['CP', 'ACP', 'TP', 'ATP', 'PROTA', 'PROSEM', 'RPP', 'MODUL', 'KKTP'];

const field = ({ label, name, value = '', type = 'text', placeholder = '', options = [], requiredMark = true }) => `
  <label class="block">
    <span class="form-label">${label}${requiredMark ? ' <span class="text-rose-500">*</span>' : ''}</span>
    ${options.length ? `
      <select name="${name}" class="form-select">
        <option value="">Pilih ${label.toLowerCase()}</option>
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
      </select>
    ` : `
      <input type="${type}" name="${name}" value="${escapeHtml(value)}" class="form-input" placeholder="${escapeHtml(placeholder)}" />
    `}
    <p data-error-for="${name}" class="field-error"></p>
  </label>
`;

export const openDocumentEditor = ({ type = 'RPP', document = null } = {}) => {
  const state = store.getState();
  const draft = !document ? state.draft : null;
  const values = {
    type: document?.type || draft?.type || type,
    title: document?.title || draft?.title || '',
    subject: document?.subject || draft?.subject || '',
    className: document?.className || draft?.className || '',
    phase: document?.phase || draft?.phase || 'E',
    topic: document?.topic || draft?.topic || '',
    duration: document?.duration || draft?.duration || '2 JP',
    content: document?.content || draft?.content || '',
  };

  openModal({
    title: document ? `Edit ${document.type}` : 'Buat Perangkat Ajar',
    description: 'Isi data utama atau gunakan AI Assistant untuk membuat draf awal.',
    size: 'max-w-4xl',
    content: `
      <form data-document-form class="space-y-6" novalidate>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${field({ label: 'Jenis Dokumen', name: 'type', value: values.type, options: documentTypes })}
          ${field({ label: 'Mata Pelajaran', name: 'subject', value: values.subject, options: subjects })}
          ${field({ label: 'Kelas', name: 'className', value: values.className, options: classes })}
          ${field({ label: 'Fase', name: 'phase', value: values.phase, options: ['A', 'B', 'C', 'D', 'E', 'F'] })}
          ${field({ label: 'Alokasi Waktu', name: 'duration', value: values.duration, placeholder: 'Contoh: 2 JP' })}
          ${field({ label: 'Materi / Topik', name: 'topic', value: values.topic, placeholder: 'Contoh: Persiapan lahan' })}
        </div>

        ${field({ label: 'Judul Dokumen', name: 'title', value: values.title, placeholder: 'Masukkan judul dokumen' })}

        <label class="block">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span class="form-label mb-0">Isi Dokumen <span class="text-rose-500">*</span></span>
            <button type="button" data-ai-generate class="btn-secondary min-h-9 px-3 py-2 text-xs">
              <i data-lucide="Sparkles" class="size-4"></i>
              Generate dengan AI
            </button>
          </div>
          <textarea name="content" rows="12" class="form-input resize-y" placeholder="Tulis isi dokumen atau buat draf otomatis...">${escapeHtml(values.content)}</textarea>
          <p data-error-for="content" class="field-error"></p>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span data-autosave-status>Perubahan disimpan otomatis.</span>
            <span data-character-count>${values.content.length} karakter</span>
          </div>
        </label>

        <div class="rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/30">
          <div class="flex gap-3">
            <i data-lucide="ShieldCheck" class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400"></i>
            <p class="text-sm text-brand-800 dark:text-brand-200">Konten AI adalah draf awal. Guru tetap wajib memeriksa kesesuaian CP, karakteristik peserta didik, konteks sekolah, dan alokasi waktu.</p>
          </div>
        </div>

        <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button type="button" data-save-draft class="btn-secondary">
            <i data-lucide="Save" class="size-4"></i>
            Simpan Draf
          </button>
          <button type="submit" class="btn-primary">
            <i data-lucide="FileCheck2" class="size-4"></i>
            ${document ? 'Simpan Perubahan' : 'Buat Dokumen'}
          </button>
        </div>
      </form>
    `,
    onOpen(root) {
      const form = root.querySelector('[data-document-form]');
      const contentField = form.elements.content;
      const count = root.querySelector('[data-character-count]');
      const autosaveStatus = root.querySelector('[data-autosave-status]');
      let autosaveTimer;

      const getFormData = () => Object.fromEntries(new FormData(form).entries());

      const saveDraft = (showToast = false) => {
        store.setState({ draft: getFormData() });
        autosaveStatus.textContent = `Draf tersimpan ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        if (showToast) toast('Draf berhasil disimpan di perangkat.', 'success');
      };

      form.addEventListener('input', () => {
        count.textContent = `${contentField.value.length} karakter`;
        autosaveStatus.textContent = 'Menyimpan perubahan...';
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(saveDraft, 500);
      });

      root.querySelector('[data-save-draft]').addEventListener('click', () => saveDraft(true));

      root.querySelector('[data-ai-generate]').addEventListener('click', async () => {
        const data = getFormData();
        if (!data.subject || !data.topic || !data.className) {
          toast('Pilih mata pelajaran, kelas, dan materi terlebih dahulu.', 'warning');
          return;
        }

        showLoading('AI sedang menyusun draf');
        try {
          const result = await mockApi.generateWithAi(data);
          form.elements.title.value = result.title;
          contentField.value = result.content;
          count.textContent = `${result.content.length} karakter`;
          saveDraft();
          toast('Draf AI berhasil dibuat.', 'success');
        } catch (error) {
          toast(error.message || 'AI gagal membuat draf.', 'error');
        } finally {
          hideLoading();
        }
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const validation = validateForm(form, {
          type: (value) => required(value, 'Jenis dokumen'),
          subject: (value) => required(value, 'Mata pelajaran'),
          className: (value) => required(value, 'Kelas'),
          phase: (value) => required(value, 'Fase'),
          duration: (value) => required(value, 'Alokasi waktu'),
          topic: (value) => required(value, 'Materi'),
          title: [(value) => required(value, 'Judul'), (value) => minLength(value, 8, 'Judul')],
          content: [(value) => required(value, 'Isi dokumen'), (value) => minLength(value, 20, 'Isi dokumen')],
        });
        renderErrors(form, validation.errors);
        if (!validation.isValid) {
          toast('Periksa kembali data yang wajib diisi.', 'warning');
          return;
        }

        showLoading(document ? 'Menyimpan perubahan' : 'Membuat dokumen');
        try {
          if (document) {
            store.updateDocument(document.id, { ...validation.data, progress: Math.max(document.progress, 70) });
          } else {
            const result = await mockApi.saveDocument(validation.data);
            store.addDocument(result);
          }
          store.setState({ draft: null });
          closeModal();
          toast(document ? 'Dokumen berhasil diperbarui.' : 'Dokumen baru berhasil dibuat.', 'success');
          window.dispatchEvent(new CustomEvent('retralabs:documents-changed'));
        } catch (error) {
          toast(error.message || 'Dokumen gagal disimpan.', 'error');
        } finally {
          hideLoading();
        }
      });
    },
  });
};
