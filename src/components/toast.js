let root;

const ensureRoot = () => {
  root = document.querySelector('#toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6';
    document.body.append(root);
  }
  return root;
};

const tones = {
  success: { icon: 'CircleCheck', style: 'border-emerald-200 bg-white text-emerald-700 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300' },
  error: { icon: 'CircleX', style: 'border-rose-200 bg-white text-rose-700 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300' },
  warning: { icon: 'TriangleAlert', style: 'border-amber-200 bg-white text-amber-700 dark:border-amber-900 dark:bg-slate-900 dark:text-amber-300' },
  info: { icon: 'Info', style: 'border-brand-200 bg-white text-brand-700 dark:border-brand-900 dark:bg-slate-900 dark:text-brand-300' },
};

export const toast = (message, tone = 'success', duration = 3200) => {
  const target = ensureRoot();
  const config = tones[tone] || tones.info;
  const item = document.createElement('div');
  item.className = `animate-slide-up rounded-2xl border p-4 shadow-2xl backdrop-blur ${config.style}`;
  item.innerHTML = `
    <div class="flex items-start gap-3">
      <span class="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-current/10">
        <i data-lucide="${config.icon}" class="size-5"></i>
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold">${message}</p>
      </div>
      <button type="button" class="rounded-lg p-1 opacity-60 transition hover:opacity-100" aria-label="Tutup notifikasi">
        <i data-lucide="X" class="size-4"></i>
      </button>
    </div>
  `;

  const close = () => {
    item.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => item.remove(), 180);
  };

  item.querySelector('button').addEventListener('click', close);
  target.append(item);
  window.dispatchEvent(new CustomEvent('retralabs:icons'));
  setTimeout(close, duration);
};
