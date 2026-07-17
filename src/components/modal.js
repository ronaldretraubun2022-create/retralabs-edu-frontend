const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('\"', '&quot;')
  .replaceAll("'", '&#039;');

const ensureRoot = () => {
  let root = document.querySelector('#modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modal-root';
    root.className = 'fixed inset-0 z-[110] hidden items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5';
    document.body.append(root);
  }
  return root;
};

export const closeModal = () => {
  const root = ensureRoot();
  root.classList.add('hidden');
  root.classList.remove('flex');
  root.innerHTML = '';
  document.body.classList.remove('overflow-hidden');
};

export const openModal = ({ title, description = '', content, size = 'max-w-2xl', onOpen }) => {
  const root = ensureRoot();
  root.innerHTML = `
    <section role="dialog" aria-modal="true" aria-labelledby="modal-title" class="animate-slide-up max-h-[92vh] w-full ${size} overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl">
      <header class="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
        <div>
          <h2 id="modal-title" class="text-lg font-black text-slate-950 dark:text-white">${escapeHtml(title)}</h2>
          ${description ? `<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(description)}</p>` : ''}
        </div>
        <button type="button" data-modal-close class="icon-btn shrink-0" aria-label="Tutup modal">
          <i data-lucide="X" class="size-5"></i>
        </button>
      </header>
      <div class="max-h-[calc(92vh-82px)] overflow-y-auto p-5 sm:p-6">${content}</div>
    </section>
  `;
  root.classList.remove('hidden');
  root.classList.add('flex');
  document.body.classList.add('overflow-hidden');

  root.onclick = (event) => {
    if (event.target === root) closeModal();
  };
  root.querySelector('[data-modal-close]').addEventListener('click', closeModal);
  window.dispatchEvent(new CustomEvent('retralabs:icons'));
  onOpen?.(root);
  return root;
};
