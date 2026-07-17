import { currentUser } from '../data/demo.js';
import { store } from '../app/store.js';
import { getActiveSchool } from '../utils/education.js';
import { escapeHtml } from '../utils/format.js';
import { closeModal, openModal } from './modal.js';
import { toast } from './toast.js';

export const topbarTemplate = ({ title, subtitle }) => {
  const state = store.getState();
  const activeSchool = getActiveSchool(state);
  const schools = state.schools || [];
  return `
  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-100/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
    <div class="flex min-h-20 items-center gap-3 px-4 sm:px-6 xl:px-8">
      <button type="button" data-sidebar-open class="icon-btn lg:hidden" aria-label="Buka sidebar">
        <i data-lucide="Menu" class="size-5"></i>
      </button>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400">
          <span>${escapeHtml(activeSchool.educationLevel)}</span>
          <span class="text-slate-300 dark:text-slate-700">/</span>
          <span>${escapeHtml(activeSchool.academicYear)}</span>
        </div>
        <h1 class="truncate text-lg font-black tracking-tight text-slate-950 dark:text-white sm:text-xl">${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">${escapeHtml(subtitle)}</p>` : ''}
      </div>

      <div class="hidden items-center gap-2 md:flex">
        <select data-school-switcher class="form-select w-56 text-xs" aria-label="Pilih sekolah aktif">
          ${schools.map((school) => `<option value="${school.id}" ${school.id === activeSchool.id ? 'selected' : ''}>${escapeHtml(school.educationLevel)} - ${escapeHtml(school.name)}</option>`).join('')}
        </select>

        <label class="relative hidden xl:block">
          <i data-lucide="Search" class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"></i>
          <input data-global-search type="search" class="form-input w-64 pl-10" placeholder="Cari dokumen, mata pelajaran..." />
        </label>

        <button type="button" data-theme-toggle class="icon-btn" aria-label="Ubah tema">
          <i data-lucide="Moon" class="size-5 dark:hidden"></i>
          <i data-lucide="Sun" class="hidden size-5 dark:block"></i>
        </button>

        <button type="button" data-notification-button class="icon-btn relative" aria-label="Notifikasi">
          <i data-lucide="Bell" class="size-5"></i>
          <span class="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        <div class="ml-1 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900">
          <div class="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-black text-white">${currentUser.initials}</div>
          <div class="hidden pr-2 xl:block">
            <p class="max-w-32 truncate text-xs font-black text-slate-900 dark:text-white">${escapeHtml(currentUser.name)}</p>
            <p class="text-[10px] font-semibold text-slate-500">${escapeHtml(currentUser.role)}</p>
          </div>
        </div>
      </div>

      <button type="button" data-mobile-actions class="icon-btn md:hidden" aria-label="Menu tindakan">
        <i data-lucide="Ellipsis" class="size-5"></i>
      </button>
    </div>
  </header>
`;
};

export const bindTopbar = () => {
  const applyTheme = (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  };

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    store.setState({ theme: nextTheme });
    applyTheme(nextTheme);
    toast(`Mode ${nextTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan.`, 'info');
  });

  document.querySelector('[data-school-switcher]')?.addEventListener('change', (event) => {
    store.switchSchool(event.currentTarget.value);
    toast('Sekolah aktif berhasil diganti.', 'success');
    setTimeout(() => window.dispatchEvent(new Event('hashchange')), 50);
  });

  document.querySelector('[data-notification-button]')?.addEventListener('click', () => {
    toast('Ada 3 pembaruan dokumen yang perlu diperiksa.', 'info');
  });

  document.querySelector('[data-mobile-actions]')?.addEventListener('click', () => {
    const state = store.getState();
    const activeSchool = getActiveSchool(state);
    openModal({
      title: 'Aksi Cepat',
      description: `${activeSchool.educationLevel} - ${activeSchool.academicYear}`,
      size: 'max-w-md',
      content: `
        <div class="space-y-4">
          <label>
            <span class="form-label">Sekolah Aktif</span>
            <select data-mobile-school-switcher class="form-select">
              ${(state.schools || []).map((school) => `<option value="${school.id}" ${school.id === activeSchool.id ? 'selected' : ''}>${escapeHtml(school.educationLevel)} - ${escapeHtml(school.name)}</option>`).join('')}
            </select>
          </label>
          <label>
            <span class="form-label">Cari Dokumen</span>
            <input data-mobile-global-search type="search" class="form-input" placeholder="Judul, kode, mapel, kelas..." />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" data-mobile-theme class="btn-secondary justify-center"><i data-lucide="Palette" class="size-4"></i>Ubah Tema</button>
            <a href="#/settings" data-mobile-close class="btn-secondary justify-center"><i data-lucide="Settings2" class="size-4"></i>Pengaturan</a>
          </div>
        </div>
      `,
      onOpen(root) {
        root.querySelector('[data-mobile-school-switcher]').addEventListener('change', (event) => {
          store.switchSchool(event.currentTarget.value);
          closeModal();
          toast('Sekolah aktif berhasil diganti.', 'success');
          setTimeout(() => window.dispatchEvent(new Event('hashchange')), 50);
        });
        root.querySelector('[data-mobile-global-search]').addEventListener('keydown', (event) => {
          if (event.key !== 'Enter') return;
          const query = event.currentTarget.value.trim();
          if (!query) return;
          closeModal();
          window.location.hash = `/documents?search=${encodeURIComponent(query)}`;
        });
        root.querySelector('[data-mobile-theme]').addEventListener('click', () => {
          const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
          store.setState({ theme: nextTheme });
          applyTheme(nextTheme);
          closeModal();
          toast(`Mode ${nextTheme === 'dark' ? 'gelap' : 'terang'} diaktifkan.`, 'info');
        });
        root.querySelector('[data-mobile-close]')?.addEventListener('click', closeModal);
      },
    });
  });

  document.querySelector('[data-global-search]')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const query = event.currentTarget.value.trim();
    if (!query) return;
    window.location.hash = `/documents?search=${encodeURIComponent(query)}`;
  });
};
