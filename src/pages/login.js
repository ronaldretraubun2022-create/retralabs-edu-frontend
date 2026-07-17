import { store } from '../app/store.js';
import { hideLoading, showLoading } from '../components/loading.js';
import { toast } from '../components/toast.js';
import { renderErrors, required, validateForm } from '../utils/validators.js';

export const renderLogin = ({ navigate }) => {
  document.querySelector('#app').innerHTML = `
    <main class="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div class="absolute -left-40 -top-40 size-[34rem] rounded-full bg-brand-600/25 blur-3xl"></div>
      <div class="absolute -bottom-48 -right-40 size-[38rem] rounded-full bg-accent-500/15 blur-3xl"></div>
      <div class="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.15fr_.85fr]">
        <section class="hidden p-8 lg:block">
          <div class="flex items-center gap-3">
            <span class="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-xl font-black shadow-2xl shadow-brand-950">R</span>
            <div><p class="text-xl font-black">RetraLabs</p><p class="text-xs font-bold uppercase tracking-[.24em] text-brand-300">Edu Suite</p></div>
          </div>
          <h1 class="mt-10 max-w-xl text-5xl font-black leading-[1.08]">Administrasi guru dalam satu alur kerja modern.</h1>
          <p class="mt-5 max-w-xl text-lg leading-8 text-slate-300">Kelola CP, ACP, TP, ATP, PROTA, PROSEM, RPP, Modul Ajar, KKTP, asesmen, dan dokumen sekolah.</p>
          <div class="mt-10 grid max-w-2xl grid-cols-3 gap-4">
            ${[['9+', 'Perangkat'], ['100%', 'Responsive'], ['24/7', 'Auto Save']].map(([value, label]) => `<div class="rounded-2xl border border-white/10 bg-white/5 p-5"><p class="text-2xl font-black">${value}</p><p class="mt-1 text-xs text-slate-400">${label}</p></div>`).join('')}
          </div>
        </section>

        <section class="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white p-6 text-slate-900 shadow-2xl sm:p-8 dark:bg-slate-900 dark:text-white">
          <div class="lg:hidden">
            <span class="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 font-black text-white">R</span>
          </div>
          <span class="badge-info mt-6 lg:mt-0"><i data-lucide="ShieldCheck" class="size-3.5"></i>Secure Workspace</span>
          <h2 class="mt-4 text-3xl font-black">Masuk ke akun</h2>
          <p class="mt-2 text-sm text-slate-500">Gunakan akun demo untuk membuka dashboard.</p>

          <form data-login-form class="mt-7 space-y-4" novalidate>
            <label><span class="form-label">Email *</span><input type="email" name="email" value="admin@retralabs.id" class="form-input" autocomplete="email" /><p data-error-for="email" class="field-error"></p></label>
            <label><span class="form-label">Kata Sandi *</span><div class="relative"><input type="password" name="password" value="retralabs123" class="form-input pr-12" autocomplete="current-password" /><button type="button" data-toggle-password class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><i data-lucide="Eye" class="size-4"></i></button></div><p data-error-for="password" class="field-error"></p></label>
            <div class="flex items-center justify-between gap-3 text-sm"><label class="flex items-center gap-2"><input type="checkbox" checked class="size-4 accent-brand-600" />Ingat saya</label><button type="button" class="font-bold text-brand-600">Lupa sandi?</button></div>
            <button type="submit" class="btn-primary w-full"><i data-lucide="LogIn" class="size-4"></i>Masuk ke Dashboard</button>
          </form>

          <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950">
            <p class="font-black">Akun Demo</p>
            <p class="mt-1 text-slate-500">admin@retralabs.id - retralabs123</p>
          </div>
        </section>
      </div>
    </main>
  `;

  window.dispatchEvent(new CustomEvent('retralabs:icons'));
  const form = document.querySelector('[data-login-form]');
  document.querySelector('[data-toggle-password]').addEventListener('click', () => {
    const input = form.elements.password;
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const validation = validateForm(form, {
      email: (value) => required(value, 'Email'),
      password: (value) => required(value, 'Kata sandi'),
    });
    renderErrors(form, validation.errors);
    if (!validation.isValid) return;
    showLoading('Memverifikasi akun');
    await new Promise((resolve) => setTimeout(resolve, 700));
    hideLoading();
    store.setState({ isAuthenticated: true });
    toast('Login berhasil. Selamat datang di RetraLabs Edu.', 'success');
    navigate('/dashboard');
  });
};
