import { currentUser, schoolProfile } from '../data/demo.js';
import { store } from '../app/store.js';
import { toast } from './toast.js';

export const topbarTemplate = ({ title, subtitle }) => `
  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-100/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
    <div class="flex min-h-20 items-center gap-3 px-4 sm:px-6 xl:px-8">
      <button type="button" data-sidebar-open class="icon-btn lg:hidden" aria-label="Buka sidebar">
        <i data-lucide="Menu" class="size-5"></i>
      </button>

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400">
          <span>${schoolProfile.level}</span>
          <span class="text-slate-300 dark:text-slate-700">/</span>
          <span>${schoolProfile.academicYear}</span>
        </div>
        <h1 class="truncate text-lg font-black tracking-tight text-slate-950 dark:text-white sm:text-xl">${title}</h1>
        ${subtitle ? `<p class="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">${subtitle}</p>` : ''}
      </div>

      <div class="hidden items-center gap-2 md:flex">
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
            <p class="max-w-32 truncate text-xs font-black text-slate-900 dark:text-white">${currentUser.name}</p>
            <p class="text-[10px] font-semibold text-slate-500">${currentUser.role}</p>
          </div>
        </div>
      </div>

      <button type="button" data-mobile-actions class="icon-btn md:hidden" aria-label="Menu tindakan">
        <i data-lucide="Ellipsis" class="size-5"></i>
      </button>
    </div>
  </header>
`;

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

  document.querySelector('[data-notification-button]')?.addEventListener('click', () => {
    toast('Ada 3 pembaruan dokumen yang perlu diperiksa.', 'info');
  });

  document.querySelector('[data-mobile-actions]')?.addEventListener('click', () => {
    toast('Gunakan menu sidebar untuk membuka seluruh fitur.', 'info');
  });

  document.querySelector('[data-global-search]')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const query = event.currentTarget.value.trim();
    if (!query) return;
    window.location.hash = `/documents?search=${encodeURIComponent(query)}`;
  });
};
