import { renderLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';

export const renderHelp = () => {
  renderLayout({
    path: '/help',
    title: 'Bantuan',
    subtitle: 'Panduan penggunaan frontend RetraLabs Edu',
    content: `
      <section class="mx-auto max-w-5xl">
        <article class="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-slate-950 p-8 text-white shadow-2xl sm:p-10">
          <span class="badge bg-white/10 text-brand-100"><i data-lucide="LifeBuoy" class="size-3.5"></i>Pusat Bantuan</span>
          <h2 class="mt-4 text-3xl font-black">Apa yang ingin Anda pelajari?</h2>
          <p class="mt-2 max-w-2xl text-brand-100">Frontend memakai Backend API saat online dan fallback lokal aman saat jaringan tidak tersedia.</p>
          <label class="relative mt-6 block max-w-2xl">
            <i data-lucide="Search" class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"></i>
            <input type="search" class="w-full rounded-2xl border-0 bg-white px-5 py-4 pl-12 text-slate-900 outline-none ring-4 ring-white/10 placeholder:text-slate-400" placeholder="Cari panduan..." />
          </label>
        </article>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          ${[
            ['Memulai Aplikasi', 'Jalankan npm install lalu npm run dev.', 'Rocket'],
            ['Membuat Perangkat Ajar', 'Buka menu Perangkat Ajar dan pilih CP, ATP, RPP, atau modul lainnya.', 'BookOpenCheck'],
            ['Export Dokumen', 'Dokumen dapat diekspor sebagai Word, JSON, atau dicetak menjadi PDF.', 'FileDown'],
            ['Menghubungkan Backend', 'Atur VITE_API_BASE_URL dan pastikan backend mengizinkan credentials dari domain frontend.', 'Cable'],
            ['Penyimpanan Lokal', 'Draft dan preferensi tersimpan aman tanpa token atau secret.', 'Database'],
            ['Responsive dan PWA', 'Layout sudah mobile-first dan dapat dikembangkan menjadi PWA.', 'Smartphone'],
          ].map(([title, description, icon]) => `
            <article class="panel flex gap-4">
              <span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><i data-lucide="${icon}" class="size-6"></i></span>
              <div><h3 class="font-black text-slate-950 dark:text-white">${title}</h3><p class="mt-2 text-sm leading-6 text-slate-500">${description}</p></div>
            </article>
          `).join('')}
        </div>

        <article class="panel mt-6 text-center">
          <i data-lucide="MessageCircleQuestion" class="mx-auto size-10 text-brand-600"></i>
          <h3 class="mt-3 text-xl font-black">Butuh bantuan teknis?</h3>
          <p class="mx-auto mt-2 max-w-xl text-sm text-slate-500">Gunakan halaman ini sebagai dasar pusat dokumentasi saat backend, pembayaran, dan AI API sudah dihubungkan.</p>
          <button type="button" data-contact-support class="btn-primary mt-5"><i data-lucide="MessagesSquare" class="size-4"></i>Hubungi Dukungan</button>
        </article>
      </section>
    `,
  });

  document.querySelector('[data-contact-support]').addEventListener('click', () => toast('Modul dukungan siap dihubungkan ke WhatsApp, email, atau ticketing.', 'info'));
};
