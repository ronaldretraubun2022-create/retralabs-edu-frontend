import { renderLayout } from '../components/layout.js';
import { questionBank } from '../data/demo.js';
import { openModal, closeModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { emptyState } from '../utils/productionUi.js';
import { required, validateForm, renderErrors } from '../utils/validators.js';

let questions = [...questionBank];

const difficultyBadge = (value) => {
  if (value === 'Sulit') return '<span class="badge-danger">Sulit</span>';
  if (value === 'Mudah') return '<span class="badge-success">Mudah</span>';
  return '<span class="badge-warning">Sedang</span>';
};

const openQuestionModal = (onSaved) => {
  openModal({
    title: 'Tambah Bank Soal',
    description: 'Buat kelompok soal untuk asesmen formatif atau sumatif.',
    content: `
      <form data-question-form class="space-y-4" novalidate>
        <div class="grid gap-4 sm:grid-cols-2">
          <label><span class="form-label">Jenis Soal *</span><select name="type" class="form-select"><option value="">Pilih jenis</option><option>Pilihan Ganda</option><option>Pilihan Ganda Kompleks</option><option>Benar / Salah</option><option>Uraian</option><option>Praktik</option></select><p data-error-for="type" class="field-error"></p></label>
          <label><span class="form-label">Mata Pelajaran *</span><input name="subject" class="form-input" placeholder="Contoh: Matematika" /><p data-error-for="subject" class="field-error"></p></label>
          <label><span class="form-label">Materi *</span><input name="topic" class="form-input" placeholder="Topik asesmen" /><p data-error-for="topic" class="field-error"></p></label>
          <label><span class="form-label">Tingkat Kesulitan *</span><select name="difficulty" class="form-select"><option value="">Pilih tingkat</option><option>Mudah</option><option>Sedang</option><option>Sulit</option></select><p data-error-for="difficulty" class="field-error"></p></label>
          <label class="sm:col-span-2"><span class="form-label">Jumlah Soal *</span><input type="number" min="1" max="100" name="questions" class="form-input" placeholder="20" /><p data-error-for="questions" class="field-error"></p></label>
        </div>
        <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button type="button" data-cancel class="btn-secondary">Batal</button>
          <button type="submit" class="btn-primary"><i data-lucide="Plus" class="size-4"></i>Tambah Bank Soal</button>
        </div>
      </form>
    `,
    onOpen(root) {
      root.querySelector('[data-cancel]').addEventListener('click', closeModal);
      root.querySelector('[data-question-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const validation = validateForm(form, {
          type: (value) => required(value, 'Jenis soal'),
          subject: (value) => required(value, 'Mata pelajaran'),
          topic: (value) => required(value, 'Materi'),
          difficulty: (value) => required(value, 'Tingkat kesulitan'),
          questions: (value) => required(value, 'Jumlah soal'),
        });
        renderErrors(form, validation.errors);
        if (!validation.isValid) {
          toast('Lengkapi data bank soal.', 'warning');
          return;
        }
        questions.unshift({ id: Date.now(), ...validation.data, questions: Number(validation.data.questions) });
        closeModal();
        onSaved();
        toast('Bank soal berhasil ditambahkan.', 'success');
      });
    },
  });
};

export const renderAssessment = () => {
  let search = '';

  const renderList = () => {
    const filtered = questions.filter((item) => [item.subject, item.topic, item.type].some((value) => value.toLowerCase().includes(search.toLowerCase())));
    const target = document.querySelector('[data-question-list]');
    target.innerHTML = filtered.map((item) => `
      <article class="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-800">
        <div class="flex items-start justify-between gap-3">
          <span class="grid size-11 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><i data-lucide="ListChecks" class="size-5"></i></span>
          ${difficultyBadge(item.difficulty)}
        </div>
        <h3 class="mt-4 text-base font-black text-slate-950 dark:text-white">${item.topic}</h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${item.subject}</p>
        <div class="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950/60">
          <div><p class="text-slate-500">Jenis</p><p class="mt-1 font-black">${item.type}</p></div>
          <div><p class="text-slate-500">Jumlah</p><p class="mt-1 font-black">${item.questions} soal</p></div>
        </div>
        <div class="mt-4 flex gap-2">
          <button type="button" class="btn-secondary min-h-9 flex-1 px-3 py-2 text-xs"><i data-lucide="Pencil" class="size-3.5"></i>Edit</button>
          <button type="button" class="btn-secondary min-h-9 px-3 py-2 text-xs"><i data-lucide="Download" class="size-3.5"></i></button>
        </div>
      </article>
    `).join('') || emptyState({ title: 'Bank soal tidak ditemukan', description: 'Ubah kata kunci atau tambah bank soal baru.' });
    window.dispatchEvent(new CustomEvent('retralabs:icons'));
  };

  renderLayout({
    path: '/assessment',
    title: 'Asesmen dan Bank Soal',
    subtitle: 'Diagnostik, formatif, sumatif, kisi-kisi, dan analisis hasil',
    content: `
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        ${[
          ['Bank Soal', questions.reduce((total, item) => total + item.questions, 0), 'Database', 'brand'],
          ['Asesmen Aktif', 12, 'ClipboardCheck', 'emerald'],
          ['Menunggu Koreksi', 38, 'Clock3', 'amber'],
          ['Rata-rata Nilai', '82,4', 'ChartColumnIncreasing', 'violet'],
        ].map(([label, value, icon, tone]) => `
          <article class="metric-card">
            <div class="flex items-start justify-between gap-4">
              <div><p class="text-sm font-bold text-slate-500">${label}</p><p class="mt-2 text-3xl font-black text-slate-950 dark:text-white">${value}</p><p class="mt-2 text-xs text-slate-400">Semester Ganjil</p></div>
              <span class="grid size-12 place-items-center rounded-2xl ${tone === 'brand' ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : tone === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'}"><i data-lucide="${icon}" class="size-6"></i></span>
            </div>
          </article>
        `).join('')}
      </section>

      <section class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <article class="panel">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 class="text-xl font-black text-slate-950 dark:text-white">Bank Soal</h2><p class="mt-1 text-sm text-slate-500">Kumpulan soal berdasarkan mata pelajaran dan materi.</p></div>
            <button type="button" data-new-question class="btn-primary"><i data-lucide="Plus" class="size-4"></i>Tambah Soal</button>
          </div>
          <label class="relative mt-5 block">
            <i data-lucide="Search" class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"></i>
            <input data-question-search type="search" class="form-input pl-10" placeholder="Cari mapel, materi, atau jenis soal..." />
          </label>
          <div data-question-list class="mt-5 grid gap-4 md:grid-cols-2"></div>
        </article>

        <aside class="space-y-6">
          <article class="panel bg-gradient-to-br from-violet-700 to-slate-950 text-white">
            <span class="grid size-12 place-items-center rounded-2xl bg-white/10"><i data-lucide="Sparkles" class="size-6 text-violet-200"></i></span>
            <h3 class="mt-5 text-xl font-black">Template Kisi-Kisi</h3>
            <p class="mt-2 text-sm leading-6 text-violet-100">Buat bank soal, kisi-kisi, kunci jawaban, dan rubrik penilaian berdasarkan TP.</p>
            <button type="button" data-generate-question class="mt-5 w-full rounded-lg bg-white px-4 py-3 text-sm font-black text-violet-800 transition hover:bg-violet-50">Buka Template</button>
          </article>

          <article class="panel">
            <h3 class="text-base font-black text-slate-950 dark:text-white">Jenis Asesmen</h3>
            <div class="mt-4 space-y-3">
              ${[
                ['Diagnostik', 'ScanSearch', 'Kognitif dan nonkognitif'],
                ['Formatif', 'Activity', 'Selama proses belajar'],
                ['Sumatif', 'FileCheck2', 'Akhir lingkup materi'],
                ['Projek', 'FolderKanban', 'Produk dan presentasi'],
              ].map(([title, icon, description]) => `
                <button type="button" class="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-300 hover:bg-brand-50 dark:border-slate-800 dark:hover:border-brand-800 dark:hover:bg-brand-950/20">
                  <span class="grid size-9 place-items-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><i data-lucide="${icon}" class="size-4"></i></span>
                  <span><span class="block text-sm font-black">${title}</span><span class="block text-xs text-slate-500">${description}</span></span>
                </button>
              `).join('')}
            </div>
          </article>
        </aside>
      </section>
    `,
  });

  document.querySelector('[data-new-question]').addEventListener('click', () => openQuestionModal(renderList));
  document.querySelector('[data-generate-question]').addEventListener('click', () => {
    openQuestionModal(renderList);
    toast('Isi parameter bank soal untuk membuat template asesmen.', 'info');
  });
  document.querySelector('[data-question-search]').addEventListener('input', (event) => { search = event.target.value; renderList(); });
  renderList();
};
