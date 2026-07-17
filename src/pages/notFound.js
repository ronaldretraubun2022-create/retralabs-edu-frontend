export const renderNotFound = () => {
  document.querySelector('#app').innerHTML = `
    <main class="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
      <div class="max-w-lg text-center">
        <div class="mx-auto grid size-24 place-items-center rounded-[2rem] bg-brand-500/15 text-brand-300"><i data-lucide="FileQuestion" class="size-12"></i></div>
        <p class="mt-8 text-sm font-black uppercase tracking-[.25em] text-brand-300">Error 404</p>
        <h1 class="mt-3 text-4xl font-black">Halaman tidak ditemukan</h1>
        <p class="mt-4 leading-7 text-slate-400">Alamat halaman tidak tersedia atau telah dipindahkan.</p>
        <a href="#/dashboard" class="btn-primary mt-7"><i data-lucide="ArrowLeft" class="size-4"></i>Kembali ke Dashboard</a>
      </div>
    </main>
  `;
  window.dispatchEvent(new CustomEvent('retralabs:icons'));
};
