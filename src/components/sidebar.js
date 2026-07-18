import { currentUser } from '../data/demo.js';
import { store } from '../app/store.js';
import { canAccessRoute, routeAccessReason } from '../app/guards.js';
import { authService } from '../services/auth.js';
import { getActiveSchool } from '../utils/education.js';
import { getBackendStatus } from '../utils/backendStatus.js';
import { escapeHtml } from '../utils/format.js';

const menuGroups = [
  {
    label: 'Workspace',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { path: '/curriculum', label: 'Kurikulum', icon: 'Network' },
      { path: '/teaching-tools', label: 'Perangkat Ajar', icon: 'BookOpenCheck', badge: '9' },
      { path: '/assessment', label: 'Asesmen', icon: 'ClipboardCheck' },
      { path: '/documents', label: 'Dokumen', icon: 'FolderKanban' },
      { path: '/approvals', label: 'Approval', icon: 'BadgeCheck' },
      { path: '/notifications', label: 'Notifikasi', icon: 'Bell' },
      { path: '/ai', label: 'AI', icon: 'Sparkles' },
    ],
  },
  {
    label: 'Bisnis',
    items: [
      { path: '/subscription', label: 'Subscription', icon: 'Crown' },
      { path: '/payments', label: 'Payment', icon: 'FileDown' },
      { path: '/usage', label: 'Usage', icon: 'Gauge' },
      { path: '/audit', label: 'Audit', icon: 'ShieldCheck' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { path: '/settings', label: 'Pengaturan', icon: 'Settings2' },
      { path: '/settings/sessions', label: 'Sesi Aktif', icon: 'Smartphone' },
      { path: '/settings/migration', label: 'Migrasi Data', icon: 'DatabaseBackup' },
      { path: '/help', label: 'Bantuan', icon: 'CircleHelp' },
    ],
  },
];

export const sidebarTemplate = (activePath) => {
  const state = store.getState();
  const activeSchool = getActiveSchool(state);
  const user = state.user || currentUser;
  const initials = user.initials || String(user.name || user.email || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const backendStatus = getBackendStatus(state);
  return `
  <div data-sidebar-backdrop class="fixed inset-0 z-40 hidden bg-slate-950/60 backdrop-blur-sm lg:hidden"></div>
  <aside data-sidebar class="fixed inset-y-0 left-0 z-50 flex w-[280px] -translate-x-full flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0">
    <div class="flex h-20 items-center justify-between border-b border-white/10 px-5">
      <a href="#/dashboard" class="flex items-center gap-3" aria-label="RetraLabs Edu">
        <span class="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 font-black shadow-lg shadow-brand-950/40">R</span>
        <span>
          <span class="block text-base font-black tracking-tight">RetraLabs</span>
          <span class="block text-[10px] font-bold uppercase tracking-[.24em] text-brand-300">Edu Suite</span>
        </span>
      </a>
      <button type="button" data-sidebar-close class="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden" aria-label="Tutup sidebar">
        <i data-lucide="X" class="size-5"></i>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-5">
      <div class="mb-5 rounded-xl border border-brand-500/20 bg-brand-500/10 p-4">
        <div class="flex items-center gap-2 text-brand-300">
          <i data-lucide="GraduationCap" class="size-4"></i>
          <span class="text-xs font-black uppercase tracking-wider">Tahun Ajaran</span>
        </div>
        <p class="mt-2 text-sm font-bold text-white">${escapeHtml(activeSchool.academicYear)} - ${escapeHtml(activeSchool.semester)}</p>
        <p class="mt-1 truncate text-xs text-slate-400">${escapeHtml(activeSchool.educationLevel)} - ${escapeHtml(activeSchool.name)}</p>
        <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div class="h-full w-[58%] rounded-full bg-gradient-to-r from-brand-400 to-accent-400"></div>
        </div>
      </div>

      <nav class="space-y-6" aria-label="Navigasi utama">
        ${menuGroups.map((group) => `
          <div>
            <p class="mb-2 px-3 text-[10px] font-black uppercase tracking-[.2em] text-slate-600">${group.label}</p>
            <div class="space-y-1">
              ${group.items.filter((item) => canAccessRoute(item.path)).map((item) => `
                <a href="#${item.path}" class="nav-link ${activePath === item.path ? 'active' : ''}" data-nav-link title="${escapeHtml(routeAccessReason(item.path))}" ${activePath === item.path ? 'aria-current="page"' : ''}>
                  <i data-lucide="${item.icon}" class="size-5 shrink-0"></i>
                  <span class="flex-1">${item.label}</span>
                  ${item.badge ? `<span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">${item.badge}</span>` : ''}
                </a>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </nav>
    </div>

    <div class="border-t border-white/10 p-4">
      <div class="mb-3 rounded-xl bg-gradient-to-br from-brand-600/30 to-accent-500/10 p-4">
        <div class="flex items-center justify-between">
          <span class="badge bg-white/10 text-brand-200">${escapeHtml(backendStatus.label)}</span>
          <i data-lucide="${backendStatus.icon}" class="size-4 text-amber-300"></i>
        </div>
        <p class="mt-2 text-xs text-slate-300">${escapeHtml(backendStatus.description)}</p>
      </div>
      <div class="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5">
        <div class="grid size-10 place-items-center rounded-lg bg-white/10 text-sm font-black">${escapeHtml(initials)}</div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold">${escapeHtml(user.name || user.email || 'User')}</p>
          <p class="truncate text-xs text-slate-500">${escapeHtml(state.role || user.role || 'Member')}</p>
        </div>
        <button type="button" data-sidebar-logout class="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white" aria-label="Logout">
          <i data-lucide="LogOut" class="size-4"></i>
        </button>
      </div>
    </div>
  </aside>
`;
};

export const bindSidebar = () => {
  const sidebar = document.querySelector('[data-sidebar]');
  const backdrop = document.querySelector('[data-sidebar-backdrop]');

  const open = () => {
    sidebar?.classList.remove('-translate-x-full');
    backdrop?.classList.remove('hidden');
    document.body.classList.add('overflow-hidden', 'lg:overflow-auto');
  };

  const close = () => {
    if (window.innerWidth >= 1024) return;
    sidebar?.classList.add('-translate-x-full');
    backdrop?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  };

  document.querySelector('[data-sidebar-open]')?.addEventListener('click', open);
  document.querySelector('[data-sidebar-close]')?.addEventListener('click', close);
  document.querySelector('[data-sidebar-logout]')?.addEventListener('click', async () => {
    await authService.logout().catch(() => null);
    store.clearSession();
    window.location.hash = '/login';
  });
  backdrop?.addEventListener('click', close);
  document.querySelectorAll('[data-nav-link]').forEach((link) => link.addEventListener('click', close));
};
