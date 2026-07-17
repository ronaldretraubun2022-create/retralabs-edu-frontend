let counter = 0;

const ensureRoot = () => {
  let root = document.querySelector('#loading-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'loading-root';
    root.className = 'fixed inset-0 z-[120] hidden items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm';
    root.innerHTML = `
      <div class="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white shadow-2xl">
        <span class="relative size-10">
          <span class="absolute inset-0 rounded-full border-4 border-white/15"></span>
          <span class="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-400"></span>
        </span>
        <div>
          <p class="text-sm font-bold" data-loading-title>Memproses data</p>
          <p class="text-xs text-slate-400">Mohon jangan tutup halaman.</p>
        </div>
      </div>
    `;
    document.body.append(root);
  }
  return root;
};

export const showLoading = (title = 'Memproses data') => {
  counter += 1;
  const root = ensureRoot();
  root.querySelector('[data-loading-title]').textContent = title;
  root.classList.remove('hidden');
  root.classList.add('flex');
};

export const hideLoading = () => {
  counter = Math.max(0, counter - 1);
  if (counter > 0) return;
  const root = ensureRoot();
  root.classList.add('hidden');
  root.classList.remove('flex');
};
