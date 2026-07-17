import { store } from '../app/store.js';
import { renderLayout } from '../components/layout.js';
import { toast } from '../components/toast.js';
import { downloadFile, escapeHtml } from '../utils/format.js';
import { EDUCATION_LEVELS, getActiveSchool } from '../utils/education.js';
import { marginConfigs, paperConfigs, themeConfigs } from '../utils/printConfig.js';
import { normalizeUiPreferences } from '../utils/productionUi.js';
import { renderErrors, required, validateForm } from '../utils/validators.js';

export const renderSettings = () => {
  const state = store.getState();
  const school = getActiveSchool(state);
  const printSettings = state.printSettings || {};
  const uiPreferences = normalizeUiPreferences(state.uiPreferences || {});

  renderLayout({
    path: '/settings',
    title: 'Pengaturan',
    subtitle: 'Profil sekolah, tampilan, dokumen, keamanan, dan backup',
    content: `
      <section class="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside class="panel h-fit p-3">
          <nav class="space-y-1">
            ${[
              ['school', 'Profil Sekolah', 'School'],
              ['appearance', 'Tampilan', 'Palette'],
              ['documents', 'Format Dokumen', 'FileCog'],
              ['security', 'Keamanan', 'ShieldCheck'],
              ['backup', 'Backup Data', 'DatabaseBackup'],
            ].map(([id, label, icon], index) => `
              <button type="button" data-settings-tab="${id}" class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${index === 0 ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}">
                <i data-lucide="${icon}" class="size-5"></i>${label}
              </button>
            `).join('')}
          </nav>
        </aside>

        <div class="space-y-6">
          <article data-settings-panel="school" class="panel">
            <div class="flex items-start gap-4">
              <span class="grid size-12 place-items-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><i data-lucide="School" class="size-6"></i></span>
              <div><h2 class="text-xl font-black text-slate-950 dark:text-white">Profil Sekolah</h2><p class="mt-1 text-sm text-slate-500">Data digunakan otomatis pada kop, identitas, dan pengesahan dokumen.</p></div>
            </div>
            <form data-school-form class="mt-6 space-y-5" novalidate>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="sm:col-span-2"><span class="form-label">Nama Sekolah *</span><input name="name" value="${escapeHtml(school.name)}" class="form-input" /><p data-error-for="name" class="field-error"></p></label>
                <input type="hidden" name="id" value="${escapeHtml(school.id)}" />
                <input type="hidden" name="educationLevel" value="${escapeHtml(school.educationLevel)}" />
                <label><span class="form-label">NPSN *</span><input name="npsn" value="${escapeHtml(school.npsn)}" class="form-input" /><p data-error-for="npsn" class="field-error"></p></label>
                <label><span class="form-label">Jenjang *</span><select name="level" class="form-select">${EDUCATION_LEVELS.map((item) => `<option ${item === school.educationLevel ? 'selected' : ''}>${item}</option>`).join('')}</select><p data-error-for="level" class="field-error"></p></label>
                <label class="sm:col-span-2"><span class="form-label">Alamat *</span><textarea name="address" rows="3" class="form-input">${escapeHtml(school.address)}</textarea><p data-error-for="address" class="field-error"></p></label>
                <label><span class="form-label">Nama Kepala Sekolah *</span><input name="principal" value="${escapeHtml(school.principal)}" class="form-input" /><p data-error-for="principal" class="field-error"></p></label>
                <label><span class="form-label">NIP Kepala Sekolah</span><input name="principalNip" value="${escapeHtml(school.principalNip)}" class="form-input" /></label>
                <label><span class="form-label">Tahun Ajaran *</span><input name="academicYear" value="${escapeHtml(school.academicYear)}" class="form-input" /><p data-error-for="academicYear" class="field-error"></p></label>
                <label><span class="form-label">Semester *</span><select name="semester" class="form-select"><option ${school.semester === 'Ganjil' ? 'selected' : ''}>Ganjil</option><option ${school.semester === 'Genap' ? 'selected' : ''}>Genap</option></select><p data-error-for="semester" class="field-error"></p></label>
              </div>
              ${school.educationLevel === 'SD' ? `
                <div class="grid gap-4 sm:grid-cols-2">
                  <label><span class="form-label">Mode Guru SD</span><select name="teacherMode" class="form-select"><option ${school.teacherMode === 'Guru Kelas dan Guru Mapel' ? 'selected' : ''}>Guru Kelas dan Guru Mapel</option><option ${school.teacherMode === 'Guru Kelas' ? 'selected' : ''}>Guru Kelas</option><option ${school.teacherMode === 'Guru Mapel' ? 'selected' : ''}>Guru Mapel</option></select></label>
                </div>
              ` : '<input type="hidden" name="teacherMode" value="">'}
              ${school.educationLevel === 'SMK' ? `
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label><span class="form-label">Bidang Keahlian</span><input name="expertiseField" value="${escapeHtml(school.expertiseField || '')}" class="form-input" /></label>
                  <label><span class="form-label">Program Keahlian</span><input name="expertiseProgram" value="${escapeHtml(school.expertiseProgram || '')}" class="form-input" /></label>
                  <label><span class="form-label">Konsentrasi Keahlian</span><input name="expertiseConcentration" value="${escapeHtml(school.expertiseConcentration || '')}" class="form-input" /></label>
                </div>
              ` : '<input type="hidden" name="expertiseField" value=""><input type="hidden" name="expertiseProgram" value=""><input type="hidden" name="expertiseConcentration" value="">'}
              <div class="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800"><button type="submit" class="btn-primary"><i data-lucide="Save" class="size-4"></i>Simpan Profil</button></div>
            </form>
          </article>

          <article data-settings-panel="appearance" class="panel hidden">
            <h2 class="text-xl font-black text-slate-950 dark:text-white">Tampilan Aplikasi</h2>
            <p class="mt-1 text-sm text-slate-500">Pilih tema yang nyaman digunakan.</p>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <button type="button" data-theme-choice="light" class="rounded-2xl border-2 border-slate-200 p-4 text-left transition hover:border-brand-400 dark:border-slate-700">
                <div class="h-32 rounded-xl bg-slate-100 p-3"><div class="h-4 w-1/2 rounded bg-white"></div><div class="mt-3 grid grid-cols-3 gap-2"><div class="h-16 rounded bg-white"></div><div class="h-16 rounded bg-white"></div><div class="h-16 rounded bg-white"></div></div></div>
                <p class="mt-3 font-black">Mode Terang</p>
              </button>
              <button type="button" data-theme-choice="dark" class="rounded-2xl border-2 border-brand-500 p-4 text-left transition hover:border-brand-400">
                <div class="h-32 rounded-xl bg-slate-950 p-3"><div class="h-4 w-1/2 rounded bg-slate-800"></div><div class="mt-3 grid grid-cols-3 gap-2"><div class="h-16 rounded bg-slate-800"></div><div class="h-16 rounded bg-slate-800"></div><div class="h-16 rounded bg-slate-800"></div></div></div>
                <p class="mt-3 font-black">Mode Gelap</p>
              </button>
            </div>
            <form data-ui-preferences-form class="mt-6 space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
              <div class="grid gap-4 sm:grid-cols-2">
                <label><span class="form-label">Kerapatan Tampilan</span><select name="density" class="form-select"><option value="comfortable" ${uiPreferences.density === 'comfortable' ? 'selected' : ''}>Nyaman</option><option value="compact" ${uiPreferences.density === 'compact' ? 'selected' : ''}>Ringkas</option></select></label>
                <label><span class="form-label">Konteks Halaman</span><select name="showPageContext" class="form-select"><option value="true" ${uiPreferences.showPageContext ? 'selected' : ''}>Tampilkan</option><option value="false" ${!uiPreferences.showPageContext ? 'selected' : ''}>Sembunyikan</option></select></label>
              </div>
              <label class="flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <input type="checkbox" name="reduceMotion" ${uiPreferences.reduceMotion ? 'checked' : ''} class="size-5 accent-brand-600" />
                <span><span class="block font-black">Kurangi animasi</span><span class="text-sm text-slate-500">Meminimalkan transisi untuk perangkat rendah daya atau preferensi aksesibilitas.</span></span>
              </label>
              <button type="submit" class="btn-primary"><i data-lucide="Save" class="size-4"></i>Simpan Preferensi UI</button>
            </form>
          </article>

          <article data-settings-panel="documents" class="panel hidden">
            <h2 class="text-xl font-black text-slate-950 dark:text-white">Format Dokumen</h2>
            <p class="mt-1 text-sm text-slate-500">Pengaturan default untuk export Word dan print browser.</p>
            <form data-print-settings-form class="mt-6 space-y-5">
              <div class="grid gap-4 sm:grid-cols-2">
                <label><span class="form-label">Ukuran Kertas</span><select name="paperSize" class="form-select">${Object.values(paperConfigs).map((paper) => `<option value="${paper.id}" ${printSettings.paperSize === paper.id ? 'selected' : ''}>${paper.label}</option>`).join('')}</select></label>
                <label><span class="form-label">Orientasi</span><select name="orientationMode" class="form-select">${[['auto', 'Otomatis'], ['portrait', 'Portrait'], ['landscape', 'Landscape']].map(([value, label]) => `<option value="${value}" ${printSettings.orientationMode === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
                <label><span class="form-label">Margin</span><select name="margin" class="form-select">${Object.keys(marginConfigs).map((key) => `<option value="${key}" ${printSettings.margin === key ? 'selected' : ''}>${key}</option>`).join('')}</select></label>
                <label><span class="form-label">Tema Dokumen</span><select name="theme" class="form-select">${Object.values(themeConfigs).map((theme) => `<option value="${theme.id}" ${printSettings.theme === theme.id ? 'selected' : ''}>${theme.label}</option>`).join('')}</select></label>
              </div>
              <label class="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <input type="checkbox" name="showSignature" ${printSettings.showSignature !== false ? 'checked' : ''} class="size-5 accent-brand-600" />
                <span><span class="block font-black">Tampilkan tanda tangan</span><span class="text-sm text-slate-500">Dipakai pada print dan export Word.</span></span>
              </label>
              <button type="submit" class="btn-primary"><i data-lucide="Save" class="size-4"></i>Simpan Format</button>
            </form>
          </article>

          <article data-settings-panel="security" class="panel hidden">
            <h2 class="text-xl font-black text-slate-950 dark:text-white">Keamanan</h2>
            <p class="mt-1 text-sm text-slate-500">Pengaturan sesi dan perlindungan akun.</p>
            <div class="mt-6 space-y-4">
              ${[
                ['Autentikasi dua langkah', 'Tambahkan lapisan keamanan saat login.', true],
                ['Kunci aplikasi otomatis', 'Kunci setelah 15 menit tidak aktif.', true],
                ['Notifikasi login baru', 'Kirim pemberitahuan jika ada perangkat baru.', false],
              ].map(([title, description, checked]) => `
                <label class="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <span><span class="block font-black">${title}</span><span class="mt-1 block text-sm text-slate-500">${description}</span></span>
                  <input type="checkbox" ${checked ? 'checked' : ''} class="size-5 accent-brand-600" />
                </label>
              `).join('')}
            </div>
          </article>

          <article data-settings-panel="backup" class="panel hidden">
            <h2 class="text-xl font-black text-slate-950 dark:text-white">Backup dan Pemulihan</h2>
            <p class="mt-1 text-sm text-slate-500">Simpan salinan data lokal sebelum menghubungkan backend.</p>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <button type="button" data-export-backup class="rounded-2xl border border-slate-200 p-5 text-left transition hover:border-brand-400 hover:bg-brand-50 dark:border-slate-800 dark:hover:border-brand-800 dark:hover:bg-brand-950/20">
                <i data-lucide="Download" class="size-7 text-brand-600"></i><p class="mt-4 font-black">Export Backup</p><p class="mt-1 text-sm text-slate-500">Unduh seluruh data sebagai JSON.</p>
              </button>
              <button type="button" data-reset-demo class="rounded-2xl border border-rose-200 p-5 text-left transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/20">
                <i data-lucide="RotateCcw" class="size-7 text-rose-600"></i><p class="mt-4 font-black">Reset Data Demo</p><p class="mt-1 text-sm text-slate-500">Kembalikan data ke kondisi awal.</p>
              </button>
            </div>
          </article>
        </div>
      </section>
    `,
  });

  const tabs = document.querySelectorAll('[data-settings-tab]');
  const panels = document.querySelectorAll('[data-settings-panel]');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((item) => item.className = 'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800');
    tab.className = 'flex w-full items-center gap-3 rounded-xl bg-brand-50 px-3 py-3 text-left text-sm font-bold text-brand-700 transition dark:bg-brand-950/40 dark:text-brand-300';
    panels.forEach((panel) => panel.classList.toggle('hidden', panel.dataset.settingsPanel !== tab.dataset.settingsTab));
  }));

  document.querySelector('[data-school-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const validation = validateForm(form, {
      name: (value) => required(value, 'Nama sekolah'),
      npsn: (value) => required(value, 'NPSN'),
      level: (value) => required(value, 'Jenjang'),
      address: (value) => required(value, 'Alamat'),
      principal: (value) => required(value, 'Nama kepala sekolah'),
      academicYear: (value) => required(value, 'Tahun ajaran'),
      semester: (value) => required(value, 'Semester'),
    });
    renderErrors(form, validation.errors);
    if (!validation.isValid) {
      toast('Periksa profil sekolah yang wajib diisi.', 'warning');
      return;
    }
    const nextSchool = { ...school, ...validation.data, educationLevel: validation.data.level, level: validation.data.level };
    store.setState((current) => ({
      schools: current.schools.map((item) => (item.id === nextSchool.id ? nextSchool : item)),
      school: nextSchool,
      activeSchoolId: nextSchool.id,
      activeAcademicYear: nextSchool.academicYear,
      activeSemester: nextSchool.semester,
    }));
    toast('Profil sekolah berhasil disimpan.', 'success');
  });

  document.querySelectorAll('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => {
    const theme = button.dataset.themeChoice;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    store.setState({ theme });
    document.querySelectorAll('[data-theme-choice]').forEach((item) => item.classList.toggle('border-brand-500', item === button));
    toast(`Mode ${theme === 'dark' ? 'gelap' : 'terang'} diaktifkan.`, 'info');
  }));

  document.querySelector('[data-ui-preferences-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget).entries());
    store.setState({
      uiPreferences: normalizeUiPreferences({
        density: formData.density,
        showPageContext: formData.showPageContext !== 'false',
        reduceMotion: Boolean(formData.reduceMotion),
      }),
    });
    toast('Preferensi UI berhasil disimpan.', 'success');
    setTimeout(() => window.dispatchEvent(new Event('hashchange')), 50);
  });

  document.querySelector('[data-print-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget).entries());
    store.setState({
      printSettings: {
        paperSize: formData.paperSize,
        orientationMode: formData.orientationMode,
        margin: formData.margin,
        theme: formData.theme,
        showSignature: Boolean(formData.showSignature),
      },
    });
    toast('Format dokumen berhasil disimpan.', 'success');
  });
  document.querySelector('[data-export-backup]').addEventListener('click', () => {
    downloadFile(`retralabs-edu-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(store.getState(), null, 2), 'application/json;charset=utf-8');
    toast('Backup data berhasil diunduh.', 'success');
  });
  document.querySelector('[data-reset-demo]').addEventListener('click', () => {
    store.reset();
    toast('Data demo berhasil direset.', 'success');
    setTimeout(() => window.location.reload(), 500);
  });
};
