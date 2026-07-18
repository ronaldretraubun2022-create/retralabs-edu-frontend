import { renderLayout } from '../components/layout.js';
import { store } from '../app/store.js';
import { curriculumFlow } from '../data/demo.js';
import { toast } from '../components/toast.js';
import { calendarEventTypes, calendarMonths, getCalendarEventsForSchool } from '../utils/academicCalendar.js';
import { getActiveSchool, getSubjectObjectsForSchool } from '../utils/education.js';
import { escapeHtml } from '../utils/format.js';
import { printAcademicCalendar } from '../utils/printEngine.js';

const phases = [
  { phase: 'A', classes: 'SD Kelas I-II', color: 'from-sky-500 to-blue-600' },
  { phase: 'B', classes: 'SD Kelas III-IV', color: 'from-cyan-500 to-teal-600' },
  { phase: 'C', classes: 'SD Kelas V-VI', color: 'from-emerald-500 to-green-600' },
  { phase: 'D', classes: 'SMP Kelas VII-IX', color: 'from-amber-500 to-orange-600' },
  { phase: 'E', classes: 'SMA/SMK Kelas X', color: 'from-violet-500 to-purple-600' },
  { phase: 'F', classes: 'SMA/SMK Kelas XI-XII', color: 'from-rose-500 to-pink-600' },
];

export const renderCurriculum = () => {
  const state = store.getState();
  const activeSchool = getActiveSchool(state);
  const subjects = getSubjectObjectsForSchool(activeSchool);
  const calendarEvents = getCalendarEventsForSchool(state.academicCalendarEvents, activeSchool);
  const calendarByMonth = new Map(calendarMonths.map((month) => [month, []]));
  calendarEvents.forEach((event) => calendarByMonth.get(event.month)?.push(event));
  const phaseText = {
    SD: 'A, B, C',
    SMP: 'D',
    SMA: 'E dan F',
    SMK: 'E dan F',
  }[activeSchool.educationLevel] || '-';
  renderLayout({
    path: '/curriculum',
    title: 'Struktur Kurikulum',
    subtitle: 'Pusat data Kurikulum Merdeka dan alur perangkat ajar',
    content: `
      <section class="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.7fr)]">
        <article class="panel overflow-hidden">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span class="badge-info"><i data-lucide="Network" class="size-3.5"></i>Alur Kurikulum</span>
              <h2 class="mt-3 text-xl font-black text-slate-950 dark:text-white">CP sampai Asesmen</h2>
              <p class="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Setiap dokumen terhubung sehingga data dapat digunakan ulang tanpa mengetik dari awal.</p>
            </div>
            <button type="button" data-sync-curriculum class="btn-secondary">
              <i data-lucide="RefreshCw" class="size-4"></i>
              Sinkronkan
            </button>
          </div>

          <div class="mt-8 overflow-x-auto pb-3">
            <div class="flex min-w-max items-center gap-3">
              ${curriculumFlow.map((item, index) => `
                <div class="flex items-center gap-3">
                  <button type="button" data-flow-code="${item.code}" class="group w-44 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-1 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-brand-800 dark:hover:bg-brand-950/30">
                    <span class="grid size-10 place-items-center rounded-xl bg-white text-brand-600 shadow-sm group-hover:bg-brand-600 group-hover:text-white dark:bg-slate-900 dark:text-brand-400">
                      <i data-lucide="${item.icon}" class="size-5"></i>
                    </span>
                    <p class="mt-3 text-sm font-black text-slate-950 dark:text-white">${item.code}</p>
                    <p class="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">${item.label}</p>
                    <div class="mt-3 flex items-center justify-between">
                      <span class="text-xs font-bold text-brand-600 dark:text-brand-400">${item.count} data</span>
                      <i data-lucide="ArrowUpRight" class="size-4 text-slate-400"></i>
                    </div>
                  </button>
                  ${index < curriculumFlow.length - 1 ? `<i data-lucide="ChevronRight" class="size-5 shrink-0 text-slate-300 dark:text-slate-700"></i>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        </article>

        <article class="panel bg-gradient-to-br from-slate-950 to-brand-950 text-white">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[.18em] text-brand-300">Kurikulum Aktif</p>
              <h3 class="mt-2 text-xl font-black">Kurikulum Merdeka</h3>
              <p class="mt-1 text-sm text-slate-300">${activeSchool.academicYear} - ${activeSchool.semester}</p>
            </div>
            <span class="grid size-12 place-items-center rounded-2xl bg-white/10"><i data-lucide="BadgeCheck" class="size-6 text-accent-400"></i></span>
          </div>
          <div class="mt-8 space-y-4">
            ${[
              ['Sekolah', activeSchool.name],
              ['Jenjang', activeSchool.educationLevel],
              ['Fase Utama', phaseText],
              ['Mata Pelajaran', `${subjects.length} aktif`],
            ].map(([label, value]) => `
              <div class="flex items-center justify-between border-b border-white/10 pb-3 last:border-0">
                <span class="text-sm text-slate-400">${label}</span>
                <span class="text-sm font-black">${value}</span>
              </div>
            `).join('')}
          </div>
          <button type="button" data-curriculum-settings class="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-brand-50">Kelola Kurikulum</button>
        </article>
      </section>

      <section class="mt-6 panel">
        <div>
          <h2 class="text-xl font-black text-slate-950 dark:text-white">Pembagian Fase</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Referensi kelas berdasarkan fase pembelajaran.</p>
        </div>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          ${phases.map((item) => `
            <article class="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div class="bg-gradient-to-br ${item.color} p-5 text-white">
                <p class="text-xs font-bold uppercase tracking-widest text-white/70">Fase</p>
                <p class="mt-1 text-4xl font-black">${item.phase}</p>
              </div>
              <div class="p-4">
                <p class="text-sm font-black text-slate-900 dark:text-white">${item.classes}</p>
                <button type="button" data-curriculum-detail="${escapeHtml(item.phase)}" class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400">Lihat detail <i data-lucide="ArrowRight" class="size-3.5"></i></button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="mt-6 panel">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <span class="badge-info"><i data-lucide="CalendarRange" class="size-3.5"></i>Kalender Pendidikan</span>
            <h2 class="mt-3 text-xl font-black text-slate-950 dark:text-white">Agenda ${escapeHtml(activeSchool.educationLevel)} ${escapeHtml(activeSchool.semester)}</h2>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Agenda terisolasi berdasarkan sekolah aktif, jenjang, tahun ajaran, dan semester.</p>
          </div>
          <button type="button" data-print-calendar class="btn-secondary">
            <i data-lucide="Printer" class="size-4"></i>
            Print Kalender
          </button>
        </div>

        <div class="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            ${calendarMonths.map((month) => {
              const events = calendarByMonth.get(month) || [];
              return `
                <article class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                  <div class="flex items-center justify-between gap-3">
                    <h3 class="text-sm font-black text-slate-950 dark:text-white">${escapeHtml(month)}</h3>
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">${events.length} agenda</span>
                  </div>
                  <div class="mt-4 space-y-2">
                    ${events.length ? events.map((event) => {
                      const type = calendarEventTypes[event.type] || calendarEventTypes.learning;
                      return `
                        <div class="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                          <div class="flex items-center justify-between gap-2">
                            <span class="${type.className} inline-flex rounded-full px-2 py-1 text-[11px] font-black">${escapeHtml(type.label)}</span>
                            <span class="text-[11px] font-bold text-slate-400">Minggu ${Number(event.week) || 1}</span>
                          </div>
                          <p class="mt-2 text-sm font-bold leading-5 text-slate-800 dark:text-slate-100">${escapeHtml(event.title)}</p>
                        </div>
                      `;
                    }).join('') : `<p class="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs font-bold text-slate-400 dark:border-slate-800">Belum ada agenda</p>`}
                  </div>
                </article>
              `;
            }).join('')}
          </div>

          <form data-calendar-form class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <h3 class="text-sm font-black text-slate-950 dark:text-white">Tambah Agenda</h3>
            <div class="mt-4 grid gap-3">
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400">
                Bulan
                <select name="month" class="form-select mt-1">
                  ${calendarMonths.map((month) => `<option>${escapeHtml(month)}</option>`).join('')}
                </select>
              </label>
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400">
                Minggu
                <select name="week" class="form-select mt-1">
                  ${[1, 2, 3, 4].map((week) => `<option value="${week}">Minggu ${week}</option>`).join('')}
                </select>
              </label>
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400">
                Jenis Agenda
                <select name="type" class="form-select mt-1">
                  ${Object.entries(calendarEventTypes).map(([key, value]) => `<option value="${key}">${escapeHtml(value.label)}</option>`).join('')}
                </select>
              </label>
              <label class="text-xs font-bold text-slate-500 dark:text-slate-400">
                Judul Agenda
                <input name="title" class="form-input mt-1" required maxlength="90" placeholder="Contoh: Asesmen sumatif akhir semester" />
              </label>
              <button type="submit" class="btn-primary justify-center"><i data-lucide="Plus" class="size-4"></i>Tambah</button>
            </div>
          </form>
        </div>
      </section>

      <section class="mt-6 grid gap-6 lg:grid-cols-2">
        <article class="panel">
          <div class="flex items-center gap-3">
            <span class="grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><i data-lucide="Layers3" class="size-5"></i></span>
            <div>
              <h3 class="text-lg font-black text-slate-950 dark:text-white">Komponen Pembelajaran</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Struktur kegiatan satuan pendidikan.</p>
            </div>
          </div>
          <div class="mt-5 space-y-3">
            ${[
              ['Intrakurikuler', 'Pembelajaran reguler berdasarkan CP dan mata pelajaran.', 'BookOpen'],
              ['Kokurikuler', 'Kegiatan kolaboratif dan kontekstual lintas disiplin.', 'UsersRound'],
              ['Ekstrakurikuler', 'Pengembangan minat, bakat, karakter, dan kepemimpinan.', 'Trophy'],
              ['Muatan Lokal', 'Bahasa, budaya, teknologi, dan potensi wilayah setempat.', 'MapPinned'],
            ].map(([title, description, icon]) => `
              <div class="panel-muted flex gap-3">
                <i data-lucide="${icon}" class="mt-0.5 size-5 shrink-0 text-brand-600 dark:text-brand-400"></i>
                <div><p class="text-sm font-black">${title}</p><p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">${description}</p></div>
              </div>
            `).join('')}
          </div>
        </article>

        <article class="panel">
          <div class="flex items-center gap-3">
            <span class="grid size-11 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><i data-lucide="Sparkles" class="size-5"></i></span>
            <div>
              <h3 class="text-lg font-black text-slate-950 dark:text-white">Dimensi Profil Lulusan</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Dipilih saat menyusun RPP dan Modul Ajar.</p>
            </div>
          </div>
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            ${['Keimanan dan ketakwaan', 'Kewargaan', 'Penalaran kritis', 'Kreativitas', 'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'].map((label, index) => `
              <div class="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-100 text-xs font-black text-brand-700 dark:bg-brand-950 dark:text-brand-300">${index + 1}</span>
                <span class="text-sm font-bold">${label}</span>
              </div>
            `).join('')}
          </div>
        </article>
      </section>
    `,
  });

  document.querySelector('[data-sync-curriculum]')?.addEventListener('click', () => toast('Data kurikulum berhasil disinkronkan.', 'success'));
  document.querySelector('[data-curriculum-settings]')?.addEventListener('click', () => toast('Pengaturan kurikulum siap dikembangkan pada backend.', 'info'));
  document.querySelector('[data-print-calendar]')?.addEventListener('click', () => {
    const latestState = store.getState();
    const school = getActiveSchool(latestState);
    try {
      printAcademicCalendar({
        events: getCalendarEventsForSchool(latestState.academicCalendarEvents, school),
        school,
        settings: latestState.printSettings,
      });
    } catch (error) {
      toast(error.message || 'Kalender tidak dapat dicetak.', 'error');
    }
  });
  document.querySelector('[data-calendar-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get('title') || '').trim();
    if (!title) return;
    const latestState = store.getState();
    const school = getActiveSchool(latestState);
    store.setState((current) => ({
      academicCalendarEvents: [
        ...current.academicCalendarEvents,
        {
          id: `cal-${school.id}-${Date.now()}`,
          schoolId: school.id,
          educationLevel: school.educationLevel,
          academicYear: school.academicYear,
          semester: school.semester,
          month: String(data.get('month')),
          week: Number(data.get('week')) || 1,
          type: String(data.get('type')),
          title,
        },
      ],
    }));
    form.reset();
    toast('Agenda kalender berhasil ditambahkan.', 'success');
    renderCurriculum();
  });
  document.querySelectorAll('[data-flow-code]').forEach((button) => button.addEventListener('click', () => {
    window.location.hash = `/teaching-tools?type=${button.dataset.flowCode}`;
  }));
  document.querySelectorAll('[data-curriculum-detail]').forEach((button) => button.addEventListener('click', () => {
    window.location.hash = `/teaching-tools?type=${button.dataset.curriculumDetail}`;
  }));
};
