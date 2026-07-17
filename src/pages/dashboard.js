import Chart from 'chart.js/auto';
import { store } from '../app/store.js';
import { renderLayout } from '../components/layout.js';
import { openDocumentEditor } from '../components/documentEditor.js';
import { activities, schedule } from '../data/demo.js';
import { filterDocumentsBySchool, getActiveSchool, levelTemplateLabel } from '../utils/education.js';

const metricCard = ({ label, value, detail, icon, tone = 'brand', trend }) => {
  const toneClasses = {
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300',
  };

  return `
    <article class="metric-card">
      <div class="relative flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-bold text-slate-500 dark:text-slate-400">${label}</p>
          <p class="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">${value}</p>
          <div class="mt-3 flex items-center gap-2 text-xs">
            ${trend ? `<span class="badge-success"><i data-lucide="TrendingUp" class="size-3.5"></i>${trend}</span>` : ''}
            <span class="text-slate-500 dark:text-slate-400">${detail}</span>
          </div>
        </div>
        <span class="grid size-12 shrink-0 place-items-center rounded-2xl ${toneClasses[tone]}">
          <i data-lucide="${icon}" class="size-6"></i>
        </span>
      </div>
    </article>
  `;
};

export const renderDashboard = () => {
  const state = store.getState();
  const activeSchool = getActiveSchool(state);
  const activeDocuments = filterDocumentsBySchool(state.documents, activeSchool.id);
  const approved = activeDocuments.filter((document) => document.status === 'approved').length;
  const review = activeDocuments.filter((document) => ['review', 'revision'].includes(document.status)).length;
  const averageProgress = Math.round(activeDocuments.reduce((total, document) => total + document.progress, 0) / Math.max(activeDocuments.length, 1));

  renderLayout({
    path: '/dashboard',
    title: 'Dashboard Operasional',
    subtitle: `${activeSchool.name} - ${activeSchool.semester}`,
    content: `
      <section class="mb-6 overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 sm:p-8">
        <div class="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div class="relative">
            <span class="badge bg-white/10 text-brand-200"><i data-lucide="Sparkles" class="size-3.5"></i>RetraLabs AI Teaching Suite</span>
            <h2 class="mt-4 max-w-3xl text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">Selamat datang, kelola perangkat ajar lebih cepat dan terstruktur.</h2>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">${levelTemplateLabel(activeSchool)} Workflow CP sampai asesmen mengikuti sekolah aktif.</p>
            <div class="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" data-create-document class="btn-primary">
                <i data-lucide="Plus" class="size-4"></i>
                Buat Perangkat Ajar
              </button>
              <a href="#/documents" class="btn border border-white/10 bg-white/10 text-white hover:bg-white/15 focus:ring-white/10">
                <i data-lucide="FolderOpen" class="size-4"></i>
                Buka Dokumen
              </a>
            </div>
          </div>
          <div class="relative hidden size-52 place-items-center rounded-[2rem] border border-white/10 bg-white/5 lg:grid">
            <div class="absolute inset-5 rounded-[1.6rem] border border-brand-400/20"></div>
            <div class="text-center">
              <div class="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-2xl shadow-brand-900/50">
                <i data-lucide="GraduationCap" class="size-10"></i>
              </div>
              <p class="mt-4 text-sm font-black">Kurikulum Merdeka</p>
              <p class="mt-1 text-xs text-slate-400">Tahun Ajaran ${activeSchool.academicYear}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        ${metricCard({ label: 'Total Dokumen', value: activeDocuments.length, detail: activeSchool.educationLevel, icon: 'Files', tone: 'brand', trend: '+12%' })}
        ${metricCard({ label: 'Dokumen Disetujui', value: approved, detail: 'siap digunakan', icon: 'BadgeCheck', tone: 'green' })}
        ${metricCard({ label: 'Perlu Tindakan', value: review, detail: 'revisi / review', icon: 'Clock3', tone: 'amber' })}
        ${metricCard({ label: 'Progress Semester', value: `${averageProgress}%`, detail: 'target perangkat', icon: 'ChartNoAxesCombined', tone: 'violet' })}
      </section>

      <section class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">
        <article class="panel">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-black text-slate-950 dark:text-white">Produktivitas Perangkat Ajar</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Dokumen dibuat dan disetujui selama enam bulan.</p>
            </div>
            <select class="form-select w-auto min-w-40 text-xs">
              <option>6 Bulan Terakhir</option>
              <option>Tahun Ajaran Ini</option>
            </select>
          </div>
          <div class="mt-6 h-72">
            <canvas id="productivity-chart"></canvas>
          </div>
        </article>

        <article class="panel">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-black text-slate-950 dark:text-white">Kelengkapan Perangkat</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Target semester aktif.</p>
            </div>
            <span class="grid size-11 place-items-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <i data-lucide="Gauge" class="size-5"></i>
            </span>
          </div>
          <div class="mt-6 flex items-center justify-center">
            <div class="relative grid size-44 place-items-center rounded-full bg-[conic-gradient(#147bea_0_72%,#e2e8f0_72%_100%)] dark:bg-[conic-gradient(#2a9dff_0_72%,#1e293b_72%_100%)]">
              <div class="grid size-32 place-items-center rounded-full bg-white text-center dark:bg-slate-900">
                <div>
                  <p class="text-3xl font-black text-slate-950 dark:text-white">72%</p>
                  <p class="text-xs font-bold text-slate-500">Selesai</p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-6 space-y-3">
            ${[['CP & ATP', 90], ['PROTA & PROSEM', 78], ['RPP & Modul', 65], ['KKTP & Asesmen', 55]].map(([name, value]) => `
              <div>
                <div class="mb-1.5 flex justify-between text-xs font-bold"><span>${name}</span><span>${value}%</span></div>
                <div class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div class="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500" style="width:${value}%"></div></div>
              </div>
            `).join('')}
          </div>
        </article>
      </section>

      <section class="mt-6 grid gap-6 xl:grid-cols-3">
        <article class="panel xl:col-span-2">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-black text-slate-950 dark:text-white">Aktivitas Terbaru</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Perubahan dokumen dan sinkronisasi sistem.</p>
            </div>
            <a href="#/documents" class="text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400">Lihat semua</a>
          </div>
          <div class="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            ${activities.map((activity) => `
              <div class="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                <span class="grid size-10 shrink-0 place-items-center rounded-xl ${activity.tone === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : activity.tone === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'}">
                  <i data-lucide="${activity.icon}" class="size-5"></i>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-black text-slate-900 dark:text-white">${activity.title}</p>
                  <p class="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">${activity.detail}</p>
                </div>
                <span class="whitespace-nowrap text-xs text-slate-400">${activity.time}</span>
              </div>
            `).join('')}
          </div>
        </article>

        <article class="panel">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="text-lg font-black text-slate-950 dark:text-white">Jadwal Hari Ini</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Sabtu, 18 Juli 2026</p>
            </div>
            <span class="badge-info">${schedule.length} Kelas</span>
          </div>
          <div class="mt-5 space-y-3">
            ${schedule.map((item) => `
              <div class="rounded-2xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-800 dark:hover:border-brand-800 dark:hover:bg-brand-950/20">
                <div class="flex items-start gap-3">
                  <div class="rounded-xl bg-slate-950 px-3 py-2 text-center text-white dark:bg-brand-600">
                    <p class="text-xs font-black">${item.time}</p>
                    <p class="text-[9px] text-slate-400 dark:text-brand-100">${item.end}</p>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-black text-slate-900 dark:text-white">${item.subject}</p>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">${item.className} - ${item.room}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </article>
      </section>
    `,
  });

  document.querySelector('[data-create-document]')?.addEventListener('click', () => openDocumentEditor({ type: 'RPP' }));

  const canvas = document.querySelector('#productivity-chart');
  const isDark = document.documentElement.classList.contains('dark');
  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Dibuat',
          data: [8, 12, 10, 18, 21, 27],
          borderColor: '#2a9dff',
          backgroundColor: 'rgba(42,157,255,.12)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Disetujui',
          data: [5, 8, 9, 13, 17, 22],
          borderColor: '#20c997',
          backgroundColor: 'rgba(32,201,151,.08)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: isDark ? '#cbd5e1' : '#475569', usePointStyle: true, padding: 20 },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
        y: {
          beginAtZero: true,
          grid: { color: isDark ? 'rgba(148,163,184,.12)' : 'rgba(148,163,184,.16)' },
          ticks: { color: isDark ? '#94a3b8' : '#64748b', precision: 0 },
        },
      },
    },
  });

  return () => chart.destroy();
};
