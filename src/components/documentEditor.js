import { mockApi } from '../app/api.js';
import { store } from '../app/store.js';
import { schoolProfile } from '../data/demo.js';
import { escapeHtml } from '../utils/format.js';
import {
  getActiveSchool,
  getClassesForSchool,
  getClassroomIdForSchool,
  getPhaseForClass,
  getSubjectIdForSchool,
  getSubjectsForSchool,
  getTeacherIdForSchool,
  getTeacherNameById,
  getTeacherOptionsForSchool,
  levelTemplateLabel,
  validateSchoolClassPhase,
} from '../utils/education.js';
import {
  buildWorkflowIssues,
  documentTypes,
  findByIdOrCode,
  formatJp,
  generateDocumentCode,
  getDocumentCode,
  getSourceDocuments,
  inheritFromSource,
  isMultiSourceType,
  normalizeIds,
  parseJp,
  sourceTypesFor,
  statusConfig,
  titleForDocument,
} from '../utils/workflow.js';
import { hideLoading, showLoading } from './loading.js';
import { closeModal, openModal } from './modal.js';
import { toast } from './toast.js';

const phases = ['A', 'B', 'C', 'D', 'E', 'F'];
const semesters = ['Ganjil', 'Genap', 'Tahunan'];
const months = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];

const field = ({ label, name, value = '', type = 'text', options = [], placeholder = '', requiredMark = true, readonly = false }) => `
  <label class="block">
    <span class="form-label">${label}${requiredMark ? ' <span class="text-rose-500">*</span>' : ''}</span>
    ${options.length ? `
      <select name="${name}" class="form-select" ${readonly ? 'disabled' : ''}>
        <option value="">Pilih ${label.toLowerCase()}</option>
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === value ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
      </select>
    ` : `
      <input type="${type}" name="${name}" value="${escapeHtml(value)}" class="form-input" placeholder="${escapeHtml(placeholder)}" ${readonly ? 'readonly' : ''} />
    `}
    <p data-error-for="${name}" class="field-error"></p>
  </label>
`;

const optionField = ({ label, name, value = '', options = [], requiredMark = true, readonly = false }) => `
  <label class="block">
    <span class="form-label">${label}${requiredMark ? ' <span class="text-rose-500">*</span>' : ''}</span>
    <select name="${name}" class="form-select" ${readonly ? 'disabled' : ''}>
      <option value="">Pilih ${label.toLowerCase()}</option>
      ${options.map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === value ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
    </select>
    <p data-error-for="${name}" class="field-error"></p>
  </label>
`;

const textAreaField = ({ label, name, value = '', rows = 3, placeholder = '', requiredMark = false, readonly = false }) => `
  <label class="block">
    <span class="form-label">${label}${requiredMark ? ' <span class="text-rose-500">*</span>' : ''}</span>
    <textarea name="${name}" rows="${rows}" class="form-input resize-y" placeholder="${escapeHtml(placeholder)}" ${readonly ? 'readonly' : ''}>${escapeHtml(value)}</textarea>
    <p data-error-for="${name}" class="field-error"></p>
  </label>
`;

const detailFields = (type, values, readonly) => {
  const common = {
    ACP: [
      ['Analisis CP', 'analysisNotes', 'Uraikan kompetensi, konten, dan konteks pembelajaran.'],
      ['Elemen Turunan', 'derivedElements', 'Tuliskan elemen hasil analisis.'],
    ],
    TP: [
      ['Tujuan Pembelajaran', 'learningObjectives', 'Rumusan tujuan pembelajaran operasional.'],
      ['Indikator TP', 'tpIndicators', 'Indikator ketercapaian tujuan pembelajaran.'],
    ],
    ATP: [
      ['Rasional Alur', 'flowRationale', 'Alasan urutan TP dan kesinambungan materi.'],
      ['Strategi Pembelajaran', 'learningStrategy', 'Strategi utama dalam alur pembelajaran.'],
    ],
    RPP: [
      ['Tujuan Pembelajaran', 'learningObjectives', 'Tujuan pertemuan atau rangkaian pertemuan.'],
      ['Kegiatan Pembelajaran', 'learningActivities', 'Pendahuluan, inti, dan penutup.'],
      ['Rencana Asesmen', 'assessmentPlan', 'Formatif, sumatif, rubrik, atau instrumen.'],
    ],
    MODUL: [
      ['Tujuan Pembelajaran', 'learningObjectives', 'Tujuan dalam modul ajar.'],
      ['Pemantik dan Aktivitas', 'learningActivities', 'Pertanyaan pemantik, langkah belajar, diferensiasi.'],
      ['Rencana Asesmen', 'assessmentPlan', 'Formatif, sumatif, dan tindak lanjut.'],
    ],
    KKTP: [
      ['Kriteria Ketercapaian', 'kktpCriteria', 'Kriteria, bukti belajar, dan ambang ketercapaian.'],
      ['Tindak Lanjut', 'followUpPlan', 'Remedial, pengayaan, atau intervensi.'],
    ],
    ASESMEN: [
      ['Rencana Asesmen', 'assessmentPlan', 'Bentuk, teknik, instrumen, dan rubrik asesmen.'],
      ['Instruksi Peserta Didik', 'studentInstructions', 'Instruksi pelaksanaan asesmen.'],
    ],
  };
  const fields = common[type] || [];
  if (!fields.length) return '';
  return `
    <section class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 class="text-sm font-black text-slate-950 dark:text-white">Detail ${type}</h3>
      <div class="mt-4 grid gap-4 ${fields.length > 1 ? 'lg:grid-cols-2' : ''}">
        ${fields.map(([label, name, placeholder]) => textAreaField({ label, name, value: values[name] || '', placeholder, readonly })).join('')}
      </div>
    </section>
  `;
};

const statusBadge = (status) => {
  const [label, className, icon] = statusConfig[status] || statusConfig.draft;
  return `<span class="${className}"><i data-lucide="${icon}" class="size-3.5"></i>${label}</span>`;
};

const compactSourceCard = (document, index = null) => `
  <div class="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="font-black text-slate-950 dark:text-white">${index ? `${index}. ` : ''}${escapeHtml(getDocumentCode(document))}</p>
        <p class="mt-1 text-xs text-slate-500">${escapeHtml(document.title)}</p>
      </div>
      <span class="badge-info">${escapeHtml(document.className)} - Fase ${escapeHtml(document.phase)}</span>
    </div>
  </div>
`;

const renderErrorState = (form, errors = {}) => {
  form.querySelectorAll('[data-error-for]').forEach((element) => {
    element.textContent = errors[element.dataset.errorFor] || '';
  });
  form.querySelectorAll('[name]').forEach((input) => {
    const hasError = Boolean(errors[input.name]);
    input.classList.toggle('border-rose-500', hasError);
    input.setAttribute('aria-invalid', String(hasError));
  });
};

const buildUnitsFromTp = (sourceIds, documents) => sourceIds
  .map((id) => findByIdOrCode(documents, id))
  .filter(Boolean)
  .map((source, index) => ({
    id: `unit-${source.id}-${index}`,
    tpId: source.id,
    title: source.topic || source.title,
    jp: parseJp(source.duration) || Number(source.totalJp || 0) || 2,
    month: months[index % months.length],
    week: index + 1,
    assessment: 'Formatif',
    note: '',
  }));

const buildUnitsFromAtp = (atp, documents) => {
  if (!atp) return [];
  if (Array.isArray(atp.units) && atp.units.length) return atp.units.map((unit, index) => ({ ...unit, id: unit.id || `unit-atp-${index}` }));
  return buildUnitsFromTp(atp.sourceIds || [], documents);
};

export const openDocumentEditor = ({ type = 'RPP', document = null, sourceDocument = null } = {}) => {
  const state = store.getState();
  const activeSchool = getActiveSchool(state);
  const classes = getClassesForSchool(activeSchool);
  const subjects = getSubjectsForSchool(activeSchool);
  const teachers = getTeacherOptionsForSchool(activeSchool);
  const readonly = document?.status === 'approved';
  const inherited = sourceDocument ? inheritFromSource(sourceDocument, type) : {};
  const draft = !document && !sourceDocument ? state.draft : null;
  const initialType = document?.type || draft?.type || type;
  const initialSourceIds = normalizeIds(document?.sourceIds || document?.referenceIds || (sourceDocument ? [sourceDocument.id] : draft?.sourceIds || []));
  const initialClassName = document?.className || draft?.className || inherited.className || '';
  const initialEducationLevel = document?.educationLevel || draft?.educationLevel || inherited.educationLevel || activeSchool.educationLevel;
  const initialValues = {
    type: initialType,
    code: document?.code || draft?.code || '',
    title: document?.title || draft?.title || '',
    subject: document?.subject || draft?.subject || inherited.subject || '',
    className: initialClassName,
    phase: document?.phase || draft?.phase || inherited.phase || getPhaseForClass(initialEducationLevel, initialClassName) || 'E',
    academicYear: document?.academicYear || draft?.academicYear || inherited.academicYear || state.activeAcademicYear || schoolProfile.academicYear,
    semester: document?.semester || draft?.semester || inherited.semester || state.activeSemester || schoolProfile.semester,
    schoolId: document?.schoolId || draft?.schoolId || inherited.schoolId || activeSchool.id,
    educationLevel: initialEducationLevel,
    teacherId: document?.teacherId || draft?.teacherId || inherited.teacherId || getTeacherIdForSchool(activeSchool, document?.teacher || draft?.teacher || inherited.teacher || ''),
    teacher: document?.teacher || draft?.teacher || inherited.teacher || getTeacherNameById(activeSchool, document?.teacherId || draft?.teacherId || inherited.teacherId) || teachers[0]?.name || '',
    subjectId: document?.subjectId || draft?.subjectId || inherited.subjectId || getSubjectIdForSchool(activeSchool, document?.subject || draft?.subject || inherited.subject || ''),
    classroomId: document?.classroomId || draft?.classroomId || inherited.classroomId || getClassroomIdForSchool(activeSchool, initialClassName),
    teacherRole: document?.teacherRole || draft?.teacherRole || '',
    electiveGroup: document?.electiveGroup || draft?.electiveGroup || '',
    expertiseField: document?.expertiseField || draft?.expertiseField || activeSchool.expertiseField || '',
    expertiseProgram: document?.expertiseProgram || draft?.expertiseProgram || activeSchool.expertiseProgram || '',
    expertiseConcentration: document?.expertiseConcentration || draft?.expertiseConcentration || activeSchool.expertiseConcentration || '',
    industryPartner: document?.industryPartner || draft?.industryPartner || '',
    certification: document?.certification || draft?.certification || '',
    topic: document?.topic || draft?.topic || sourceDocument?.topic || '',
    duration: document?.duration || draft?.duration || sourceDocument?.duration || '2 JP',
    totalJp: Number(document?.totalJp || draft?.totalJp || parseJp(sourceDocument?.duration) || 2),
    content: document?.content || draft?.content || '',
    elements: Array.isArray(document?.elements) ? document.elements.join('\n') : (draft?.elements || ''),
    analysisNotes: document?.analysisNotes || draft?.analysisNotes || '',
    derivedElements: document?.derivedElements || draft?.derivedElements || '',
    learningObjectives: document?.learningObjectives || draft?.learningObjectives || '',
    tpIndicators: document?.tpIndicators || draft?.tpIndicators || '',
    flowRationale: document?.flowRationale || draft?.flowRationale || '',
    learningStrategy: document?.learningStrategy || draft?.learningStrategy || '',
    learningActivities: document?.learningActivities || draft?.learningActivities || '',
    assessmentPlan: document?.assessmentPlan || draft?.assessmentPlan || '',
    kktpCriteria: document?.kktpCriteria || draft?.kktpCriteria || '',
    followUpPlan: document?.followUpPlan || draft?.followUpPlan || '',
    studentInstructions: document?.studentInstructions || draft?.studentInstructions || '',
  };
  if (!initialValues.code) {
    initialValues.code = generateDocumentCode({
      documents: state.documents,
      type: initialValues.type,
      subject: initialValues.subject,
      phase: initialValues.phase,
      academicYear: initialValues.academicYear,
      semester: initialValues.semester,
      schoolId: initialValues.schoolId,
      educationLevel: initialValues.educationLevel,
      excludeId: document?.id,
    });
  }

  let selectedSourceIds = [...initialSourceIds];
  let manualTotalJp = Boolean(document?.totalJp);
  let codeTouched = Boolean(document?.code);
  let units = Array.isArray(document?.units) ? structuredClone(document.units) : [];
  let schedules = Array.isArray(document?.schedules) ? structuredClone(document.schedules) : [];

  openModal({
    title: document ? `Edit ${document.type}` : `Buat ${initialType}`,
    description: readonly ? 'Dokumen disetujui. Kembalikan ke revisi/draf sebelum mengubah isi.' : 'Metadata, sumber, dan relasi dokumen akan divalidasi sesuai alur kurikulum.',
    size: 'max-w-6xl',
    content: `
      <form data-document-form class="space-y-6" novalidate>
        <input type="hidden" name="schoolId" value="${escapeHtml(initialValues.schoolId)}" />
        <input type="hidden" name="educationLevel" value="${escapeHtml(initialValues.educationLevel)}" />
        <input type="hidden" name="subjectId" value="${escapeHtml(initialValues.subjectId)}" />
        <input type="hidden" name="classroomId" value="${escapeHtml(initialValues.classroomId)}" />
        <input type="hidden" name="teacher" value="${escapeHtml(initialValues.teacher)}" />
        <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p class="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">${escapeHtml(activeSchool.educationLevel)} / ${escapeHtml(activeSchool.name)} / ${escapeHtml(initialType)}</p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">${escapeHtml(levelTemplateLabel(activeSchool))}</p>
          </div>
          ${statusBadge(document?.status || 'draft')}
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          ${field({ label: 'Jenis Dokumen', name: 'type', value: initialValues.type, options: documentTypes, readonly })}
          ${field({ label: 'Kode Dokumen', name: 'code', value: initialValues.code, readonly })}
          ${field({ label: 'Mata Pelajaran', name: 'subject', value: initialValues.subject, options: subjects, readonly })}
          ${field({ label: 'Kelas', name: 'className', value: initialValues.className, options: classes, readonly })}
          ${field({ label: 'Fase', name: 'phase', value: initialValues.phase, options: phases, readonly })}
          ${field({ label: 'Tahun Ajaran', name: 'academicYear', value: initialValues.academicYear, readonly })}
          ${field({ label: 'Semester', name: 'semester', value: initialValues.semester, options: semesters, readonly })}
          ${optionField({ label: 'Guru Pengampu', name: 'teacherId', value: initialValues.teacherId, options: teachers.map((teacher) => ({ value: teacher.id, label: `${teacher.name} - ${teacher.role}` })), readonly })}
        </div>

        ${activeSchool.educationLevel === 'SD' ? `
          <section class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 class="text-sm font-black text-slate-950 dark:text-white">Mode SD</h3>
            <p class="mt-1 text-xs text-slate-500">Guru kelas hanya tersedia pada jenjang SD.</p>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              ${field({ label: 'Peran Guru', name: 'teacherRole', value: initialValues.teacherRole, options: ['Guru Kelas', 'Guru Mapel'], readonly })}
            </div>
          </section>
        ` : '<input type="hidden" name="teacherRole" value="">'}

        ${activeSchool.educationLevel === 'SMA' ? `
          <section class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 class="text-sm font-black text-slate-950 dark:text-white">Mode SMA</h3>
            <p class="mt-1 text-xs text-slate-500">Gunakan untuk mata pelajaran pilihan dan kelompok pilihan.</p>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              ${field({ label: 'Kelompok Pilihan', name: 'electiveGroup', value: initialValues.electiveGroup, options: activeSchool.electiveGroups || ['Sains dan Teknologi', 'Sosial Humaniora', 'Bahasa dan Budaya'], requiredMark: false, readonly })}
            </div>
          </section>
        ` : '<input type="hidden" name="electiveGroup" value="">'}

        ${activeSchool.educationLevel === 'SMK' ? `
          <section class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 class="text-sm font-black text-slate-950 dark:text-white">Mode SMK</h3>
            <p class="mt-1 text-xs text-slate-500">Bidang, program, konsentrasi keahlian, PKL, mitra dunia kerja, sertifikasi, dan UKK.</p>
            <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              ${field({ label: 'Bidang Keahlian', name: 'expertiseField', value: initialValues.expertiseField, requiredMark: false, readonly })}
              ${field({ label: 'Program Keahlian', name: 'expertiseProgram', value: initialValues.expertiseProgram, requiredMark: false, readonly })}
              ${field({ label: 'Konsentrasi Keahlian', name: 'expertiseConcentration', value: initialValues.expertiseConcentration, requiredMark: false, readonly })}
              ${field({ label: 'Mitra Dunia Kerja', name: 'industryPartner', value: initialValues.industryPartner, options: activeSchool.industryPartners || [], requiredMark: false, readonly })}
              ${field({ label: 'Sertifikasi / UKK', name: 'certification', value: initialValues.certification, options: activeSchool.certifications || [], requiredMark: false, readonly })}
            </div>
          </section>
        ` : '<input type="hidden" name="expertiseField" value=""><input type="hidden" name="expertiseProgram" value=""><input type="hidden" name="expertiseConcentration" value=""><input type="hidden" name="industryPartner" value=""><input type="hidden" name="certification" value="">'}

        <section class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="text-sm font-black text-slate-950 dark:text-white">Sumber Dokumen</h3>
              <p class="mt-1 text-xs text-slate-500">Difilter berdasarkan mata pelajaran, kelas, fase, tahun ajaran, dan semester.</p>
            </div>
            <span class="badge-info" data-source-rule></span>
          </div>
          <div data-source-options></div>
          <p data-error-for="sourceIds" class="field-error"></p>
          <div data-selected-sources class="mt-4 grid gap-2"></div>
        </section>

        <div class="grid gap-4 lg:grid-cols-[1fr_220px]">
          ${field({ label: 'Materi / Topik', name: 'topic', value: initialValues.topic, placeholder: 'Contoh: Perancangan algoritma', readonly })}
          ${field({ label: 'Total Alokasi JP', name: 'totalJp', value: initialValues.totalJp, type: 'number', readonly })}
        </div>
        <p data-total-warning class="-mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400"></p>

        ${detailFields(initialType, initialValues, readonly)}

        <label class="block" data-cp-elements>
          <span class="form-label">Elemen CP <span class="text-rose-500">*</span></span>
          <textarea name="elements" rows="3" class="form-input resize-y" placeholder="Satu elemen per baris" ${readonly ? 'readonly' : ''}>${escapeHtml(initialValues.elements)}</textarea>
          <p data-error-for="elements" class="field-error"></p>
        </label>

        <section data-unit-section class="hidden rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-black text-slate-950 dark:text-white" data-unit-title>Unit / Materi</h3>
              <p class="mt-1 text-xs text-slate-500" data-unit-subtitle>Atur alokasi, bulan, minggu, dan keterangan.</p>
            </div>
            <button type="button" data-add-unit class="btn-secondary min-h-9 px-3 py-2 text-xs" ${readonly ? 'disabled' : ''}>
              <i data-lucide="Plus" class="size-4"></i>Tambah Baris
            </button>
          </div>
          <div data-unit-list class="grid gap-3"></div>
          <p data-error-for="units" class="field-error"></p>
        </section>

        <label class="block">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span class="form-label mb-0">Isi Dokumen <span class="text-rose-500">*</span></span>
            <button type="button" data-template-draft class="btn-secondary min-h-9 px-3 py-2 text-xs" ${readonly ? 'disabled' : ''}>
              <i data-lucide="Sparkles" class="size-4"></i>Buat Draf Template
            </button>
          </div>
          <textarea name="content" rows="9" class="form-input resize-y" placeholder="Tulis isi dokumen atau buat draf otomatis..." ${readonly ? 'readonly' : ''}>${escapeHtml(initialValues.content)}</textarea>
          <p data-error-for="content" class="field-error"></p>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span data-autosave-status>Perubahan disimpan otomatis.</span>
            <span data-character-count>${initialValues.content.length} karakter</span>
          </div>
        </label>

        <footer class="sticky bottom-0 z-10 -mx-5 -mb-5 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end">
          <button type="button" data-save-draft class="btn-secondary" ${readonly ? 'disabled' : ''}>
            <i data-lucide="Save" class="size-4"></i>Simpan Draf
          </button>
          <button type="submit" class="btn-primary" ${readonly ? 'disabled' : ''}>
            <i data-lucide="FileCheck2" class="size-4"></i>${document ? 'Simpan Perubahan' : 'Buat Dokumen'}
          </button>
        </footer>
      </form>
    `,
    onOpen(root) {
      const form = root.querySelector('[data-document-form]');
      const sourceOptions = root.querySelector('[data-source-options]');
      const sourceRule = root.querySelector('[data-source-rule]');
      const selectedSources = root.querySelector('[data-selected-sources]');
      const totalWarning = root.querySelector('[data-total-warning]');
      const unitSection = root.querySelector('[data-unit-section]');
      const unitList = root.querySelector('[data-unit-list]');
      const unitTitle = root.querySelector('[data-unit-title]');
      const unitSubtitle = root.querySelector('[data-unit-subtitle]');
      const cpElements = root.querySelector('[data-cp-elements]');
      const contentField = form.elements.content;
      const count = root.querySelector('[data-character-count]');
      const autosaveStatus = root.querySelector('[data-autosave-status]');
      let autosaveTimer;

      const getFormData = () => Object.fromEntries(new FormData(form).entries());
      const currentValues = () => ({ ...initialValues, ...getFormData(), sourceIds: selectedSourceIds });

      const selectedDocs = () => selectedSourceIds.map((id) => findByIdOrCode(store.getState().documents, id)).filter(Boolean);

      const syncMasterRefs = () => {
        if (form.elements.subjectId) form.elements.subjectId.value = getSubjectIdForSchool(activeSchool, form.elements.subject.value);
        if (form.elements.classroomId) form.elements.classroomId.value = getClassroomIdForSchool(activeSchool, form.elements.className.value);
        if (form.elements.teacher && form.elements.teacherId) {
          form.elements.teacher.value = getTeacherNameById(activeSchool, form.elements.teacherId.value);
        }
      };

      const syncCode = () => {
        if (readonly || codeTouched) return;
        const data = currentValues();
        form.elements.code.value = generateDocumentCode({
          documents: store.getState().documents,
          type: data.type,
          subject: data.subject,
          phase: data.phase,
          academicYear: data.academicYear,
          semester: data.semester,
          schoolId: data.schoolId,
          educationLevel: data.educationLevel,
          excludeId: document?.id,
        });
      };

      const updateTotalWarning = () => {
        const selectedTotal = selectedDocs().reduce((sum, item) => sum + (Number(item.totalJp) || parseJp(item.duration)), 0);
        const total = Number(form.elements.totalJp.value || 0);
        totalWarning.textContent = selectedTotal && total !== selectedTotal
          ? `Peringatan: total sumber adalah ${selectedTotal} JP, sedangkan dokumen ini ${total} JP.`
          : '';
      };

      const inheritMetadata = (source) => {
        if (!source || readonly) return;
        const inheritedValues = inheritFromSource(source, form.elements.type.value);
        ['subject', 'className', 'phase', 'academicYear', 'semester', 'teacher', 'schoolId', 'educationLevel'].forEach((key) => {
          if (form.elements[key]) form.elements[key].value = inheritedValues[key] || form.elements[key].value;
        });
        if (form.elements.teacherId && inheritedValues.teacherId) form.elements.teacherId.value = inheritedValues.teacherId;
        if (form.elements.subjectId && inheritedValues.subjectId) form.elements.subjectId.value = inheritedValues.subjectId;
        if (form.elements.classroomId && inheritedValues.classroomId) form.elements.classroomId.value = inheritedValues.classroomId;
        if (!form.elements.topic.value) form.elements.topic.value = source.topic || source.title;
        syncMasterRefs();
        syncCode();
      };

      const ensureUnits = () => {
        const data = currentValues();
        if (data.type === 'PROTA') {
          const atp = selectedDocs()[0];
          if (!units.length && atp) units = buildUnitsFromAtp(atp, store.getState().documents);
        }
        if (data.type === 'PROSEM') {
          const prota = selectedDocs()[0];
          if (!schedules.length && prota) schedules = buildUnitsFromAtp(prota, store.getState().documents);
        }
      };

      const renderSelectedSources = () => {
        const docs = selectedDocs();
        selectedSources.innerHTML = docs.length ? docs.map((item, index) => `
          <div class="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-[1fr_auto] sm:items-center">
            ${compactSourceCard(item, index + 1)}
            ${isMultiSourceType(form.elements.type.value) && !readonly ? `
              <div class="flex gap-1 sm:justify-end">
                <button type="button" data-source-up="${item.id}" class="icon-btn size-9 min-h-9 rounded-lg" title="Naik"><i data-lucide="ArrowUp" class="size-4"></i></button>
                <button type="button" data-source-down="${item.id}" class="icon-btn size-9 min-h-9 rounded-lg" title="Turun"><i data-lucide="ArrowDown" class="size-4"></i></button>
              </div>
            ` : ''}
          </div>
        `).join('') : '<div class="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700">Belum ada sumber yang dipilih.</div>';

        selectedSources.querySelectorAll('[data-source-up]').forEach((button) => button.addEventListener('click', () => {
          const index = selectedSourceIds.indexOf(button.dataset.sourceUp);
          if (index > 0) [selectedSourceIds[index - 1], selectedSourceIds[index]] = [selectedSourceIds[index], selectedSourceIds[index - 1]];
          renderSelectedSources();
          renderUnits();
        }));
        selectedSources.querySelectorAll('[data-source-down]').forEach((button) => button.addEventListener('click', () => {
          const index = selectedSourceIds.indexOf(button.dataset.sourceDown);
          if (index < selectedSourceIds.length - 1) [selectedSourceIds[index + 1], selectedSourceIds[index]] = [selectedSourceIds[index], selectedSourceIds[index + 1]];
          renderSelectedSources();
          renderUnits();
        }));
        updateTotalWarning();
        window.dispatchEvent(new CustomEvent('retralabs:icons'));
      };

      const renderSources = () => {
        const data = currentValues();
        cpElements.classList.toggle('hidden', data.type !== 'CP');
        const sourceTypes = sourceTypesFor(data.type);
        sourceRule.textContent = sourceTypes.length ? `Sumber: ${sourceTypes.join(' / ')}` : 'Tanpa sumber';
        if (!sourceTypes.length) {
          selectedSourceIds = [];
          sourceOptions.innerHTML = '<div class="rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700">Dokumen ini menjadi awal alur.</div>';
          renderSelectedSources();
          return;
        }

        const options = getSourceDocuments(store.getState().documents, data);
        selectedSourceIds = selectedSourceIds.filter((id) => options.some((item) => item.id === id || getDocumentCode(item) === id));
        const multi = isMultiSourceType(data.type);
        sourceOptions.innerHTML = options.length ? `
          <div class="grid gap-3 md:grid-cols-2">
            ${options.map((item) => {
              const checked = selectedSourceIds.includes(item.id);
              return `
                <label class="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-800">
                  <input ${multi ? 'type="checkbox"' : 'type="radio"'} name="sourceChoice" value="${escapeHtml(item.id)}" ${checked ? 'checked' : ''} class="mt-1 size-4 accent-brand-600" ${readonly ? 'disabled' : ''} />
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-sm font-black text-slate-950 dark:text-white">${escapeHtml(getDocumentCode(item))}</span>
                      <span class="badge-info">${escapeHtml(item.className)} - Fase ${escapeHtml(item.phase)}</span>
                    </div>
                    <p class="mt-1 line-clamp-2 text-xs text-slate-500">${escapeHtml(item.title)}</p>
                  </div>
                </label>
              `;
            }).join('')}
          </div>
        ` : '<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">Tidak ada sumber yang cocok untuk metadata ini.</div>';

        sourceOptions.querySelectorAll('[name="sourceChoice"]').forEach((input) => {
          input.addEventListener('change', () => {
            if (multi) {
              selectedSourceIds = input.checked
                ? normalizeIds([...selectedSourceIds, input.value])
                : selectedSourceIds.filter((id) => id !== input.value);
            } else {
              selectedSourceIds = [input.value];
              inheritMetadata(findByIdOrCode(store.getState().documents, input.value));
            }
            if (!manualTotalJp && multi) form.elements.totalJp.value = selectedDocs().reduce((sum, item) => sum + (Number(item.totalJp) || parseJp(item.duration)), 0) || form.elements.totalJp.value;
            units = [];
            schedules = [];
            ensureUnits();
            renderSelectedSources();
            renderUnits();
          });
        });
        renderSelectedSources();
      };

      const readUnitsFromDom = () => {
        const rows = [...unitList.querySelectorAll('[data-unit-row]')];
        return rows.map((row) => ({
          id: row.dataset.unitId,
          tpId: row.querySelector('[name="unitTpId"]')?.value || '',
          title: row.querySelector('[name="unitTitle"]')?.value || '',
          jp: Number(row.querySelector('[name="unitJp"]')?.value || 0),
          month: row.querySelector('[name="unitMonth"]')?.value || '',
          week: Number(row.querySelector('[name="unitWeek"]')?.value || 1),
          schedule: row.querySelector('[name="unitSchedule"]')?.value || '',
          assessment: row.querySelector('[name="unitAssessment"]')?.value || '',
          note: row.querySelector('[name="unitNote"]')?.value || '',
        }));
      };

      const renderUnits = () => {
        ensureUnits();
        const data = currentValues();
        const isProta = data.type === 'PROTA';
        const isProsem = data.type === 'PROSEM';
        const rows = isProsem ? schedules : units;
        unitSection.classList.toggle('hidden', !isProta && !isProsem);
        if (!isProta && !isProsem) return;
        unitTitle.textContent = isProta ? 'Unit PROTA dari ATP' : 'Kalender Distribusi Minggu Efektif';
        unitSubtitle.textContent = isProta ? 'Unit otomatis dari TP pada ATP, tetap bisa disesuaikan.' : 'Susun bulan, minggu ke, jadwal, asesmen, dan keterangan dari PROTA.';
        unitList.innerHTML = rows.length ? rows.map((unit, index) => `
          <div data-unit-row data-unit-id="${escapeHtml(unit.id || `unit-${index}`)}" class="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <div class="mb-3 flex items-center justify-between gap-3">
              <span class="grid size-8 place-items-center rounded-lg bg-brand-100 text-xs font-black text-brand-700 dark:bg-brand-950 dark:text-brand-300">${index + 1}</span>
              <div class="flex gap-1">
                <button type="button" data-unit-up="${index}" class="icon-btn size-8 min-h-8 rounded-lg" ${readonly ? 'disabled' : ''} title="Naik"><i data-lucide="ArrowUp" class="size-4"></i></button>
                <button type="button" data-unit-down="${index}" class="icon-btn size-8 min-h-8 rounded-lg" ${readonly ? 'disabled' : ''} title="Turun"><i data-lucide="ArrowDown" class="size-4"></i></button>
                <button type="button" data-unit-delete="${index}" class="icon-btn size-8 min-h-8 rounded-lg text-rose-600" ${readonly ? 'disabled' : ''} title="Hapus"><i data-lucide="Trash2" class="size-4"></i></button>
              </div>
            </div>
            <input type="hidden" name="unitTpId" value="${escapeHtml(unit.tpId || '')}" />
            <div class="grid gap-3 lg:grid-cols-[1.4fr_100px_140px_100px]">
              <input name="unitTitle" class="form-input" value="${escapeHtml(unit.title || '')}" placeholder="Unit / materi" ${readonly ? 'readonly' : ''} />
              <input name="unitJp" type="number" min="1" class="form-input" value="${escapeHtml(unit.jp || 1)}" placeholder="JP" ${readonly ? 'readonly' : ''} />
              <select name="unitMonth" class="form-select" ${readonly ? 'disabled' : ''}>${months.map((month) => `<option value="${month}" ${month === unit.month ? 'selected' : ''}>${month}</option>`).join('')}</select>
              <input name="unitWeek" type="number" min="1" max="6" class="form-input" value="${escapeHtml(unit.week || index + 1)}" placeholder="Minggu" ${readonly ? 'readonly' : ''} />
            </div>
            ${isProsem ? `
              <div class="mt-3 grid gap-3 lg:grid-cols-2">
                <input name="unitSchedule" class="form-input" value="${escapeHtml(unit.schedule || '')}" placeholder="Jadwal pelaksanaan" ${readonly ? 'readonly' : ''} />
                <input name="unitAssessment" class="form-input" value="${escapeHtml(unit.assessment || '')}" placeholder="Asesmen" ${readonly ? 'readonly' : ''} />
              </div>
            ` : '<input type="hidden" name="unitSchedule" value=""><input type="hidden" name="unitAssessment" value="">'}
            <input name="unitNote" class="form-input mt-3" value="${escapeHtml(unit.note || '')}" placeholder="Keterangan" ${readonly ? 'readonly' : ''} />
          </div>
        `).join('') : '<div class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">Belum ada baris distribusi.</div>';

        unitList.querySelectorAll('[data-unit-up]').forEach((button) => button.addEventListener('click', () => {
          const list = isProsem ? schedules : units;
          const index = Number(button.dataset.unitUp);
          if (index > 0) [list[index - 1], list[index]] = [list[index], list[index - 1]];
          renderUnits();
        }));
        unitList.querySelectorAll('[data-unit-down]').forEach((button) => button.addEventListener('click', () => {
          const list = isProsem ? schedules : units;
          const index = Number(button.dataset.unitDown);
          if (index < list.length - 1) [list[index + 1], list[index]] = [list[index], list[index + 1]];
          renderUnits();
        }));
        unitList.querySelectorAll('[data-unit-delete]').forEach((button) => button.addEventListener('click', () => {
          const list = isProsem ? schedules : units;
          list.splice(Number(button.dataset.unitDelete), 1);
          renderUnits();
        }));
        window.dispatchEvent(new CustomEvent('retralabs:icons'));
      };

      const saveDraft = (showToast = false) => {
        if (readonly) return;
        store.setState({ draft: { ...getFormData(), sourceIds: selectedSourceIds } });
        autosaveStatus.textContent = `Draf tersimpan ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
        if (showToast) toast('Draf berhasil disimpan di perangkat.', 'success');
      };

      const validate = () => {
        units = currentValues().type === 'PROTA' ? readUnitsFromDom() : units;
        schedules = currentValues().type === 'PROSEM' ? readUnitsFromDom() : schedules;
        const data = {
          ...getFormData(),
          sourceIds: normalizeIds(selectedSourceIds),
          referenceIds: normalizeIds(selectedSourceIds),
          totalJp: Number(form.elements.totalJp.value || 0),
          duration: formatJp(Number(form.elements.totalJp.value || 0)),
          elements: String(form.elements.elements?.value || '').split('\n').map((item) => item.trim()).filter(Boolean),
          units,
          schedules,
        };
        data.title = data.title || titleForDocument(data);
        const errors = {};
        ['type', 'code', 'subject', 'className', 'phase', 'academicYear', 'semester', 'topic', 'content'].forEach((key) => {
          if (!String(data[key] || '').trim()) errors[key] = `${key === 'className' ? 'Kelas' : key} wajib diisi.`;
        });
        ['teacherId', 'subjectId', 'classroomId', 'schoolId', 'educationLevel'].forEach((key) => {
          if (!String(data[key] || '').trim()) errors[key] = `${key} wajib tersedia.`;
        });
        if (data.code.includes('-MAPEL-')) errors.code = 'Kode mata pelajaran harus memakai kode Data Master, bukan MAPEL.';
        if (store.getState().documents.some((item) => item.id !== document?.id && getDocumentCode(item) === data.code)) errors.code = 'Kode dokumen harus unik.';
        const classPhaseError = validateSchoolClassPhase({ school: activeSchool, className: data.className, phase: data.phase });
        if (classPhaseError) errors.phase = classPhaseError;
        if (data.type === 'CP' && !data.elements.length) errors.elements = 'Minimal satu elemen CP wajib diisi.';
        if (sourceTypesFor(data.type).length && !data.sourceIds.length) errors.sourceIds = 'Sumber dokumen wajib dipilih.';
        if (data.type === 'ATP' && data.sourceIds.length < 1) errors.sourceIds = 'ATP wajib memilih minimal satu TP.';
        if (data.totalJp <= 0) errors.totalJp = 'Jumlah alokasi waktu harus valid.';
        if (['PROTA', 'PROSEM'].includes(data.type)) {
          const list = data.type === 'PROTA' ? data.units : data.schedules;
          const total = list.reduce((sum, unit) => sum + Number(unit.jp || 0), 0);
          if (!list.length || total <= 0) errors.units = 'Minimal satu baris unit dengan JP valid wajib diisi.';
        }
        const workflowIssues = buildWorkflowIssues(data, store.getState().documents);
        if (workflowIssues.length) errors.sourceIds = workflowIssues[0];
        return { data, errors, isValid: Object.keys(errors).length === 0 };
      };

      ['type', 'subject', 'className', 'phase', 'academicYear', 'semester'].forEach((name) => {
        form.elements[name]?.addEventListener('change', () => {
          if (name === 'type') {
            selectedSourceIds = [];
            units = [];
            schedules = [];
          }
          if (name === 'className') {
            const nextPhase = getPhaseForClass(activeSchool.educationLevel, form.elements.className.value);
            if (nextPhase) form.elements.phase.value = nextPhase;
          }
          syncMasterRefs();
          syncCode();
          renderSources();
          renderUnits();
        });
      });
      form.elements.teacherId?.addEventListener('change', () => {
        syncMasterRefs();
        selectedSourceIds = [];
        renderSources();
      });
      form.elements.code.addEventListener('input', () => { codeTouched = true; });
      form.elements.totalJp.addEventListener('input', () => { manualTotalJp = true; updateTotalWarning(); });
      form.addEventListener('input', () => {
        count.textContent = `${contentField.value.length} karakter`;
        autosaveStatus.textContent = 'Menyimpan perubahan...';
        clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(saveDraft, 500);
      });
      root.querySelector('[data-add-unit]').addEventListener('click', () => {
        const data = currentValues();
        const list = data.type === 'PROSEM' ? schedules : units;
        list.push({ id: `unit-${Date.now()}`, title: '', jp: 1, month: months[0], week: list.length + 1, assessment: '', schedule: '', note: '' });
        renderUnits();
      });
      root.querySelector('[data-save-draft]').addEventListener('click', () => saveDraft(true));
      root.querySelector('[data-template-draft]').addEventListener('click', async () => {
        const data = currentValues();
        if (!data.subject || !data.topic || !data.className) {
          toast('Pilih mata pelajaran, kelas, dan materi terlebih dahulu.', 'warning');
          return;
        }
        showLoading('Template sedang menyusun draf');
        try {
          const result = await mockApi.generateWithAi({ ...data, duration: formatJp(data.totalJp) });
          form.elements.title.value = result.title;
          contentField.value = result.content;
          count.textContent = `${result.content.length} karakter`;
          saveDraft();
          toast('Draf template berhasil dibuat.', 'success');
        } catch (error) {
          toast(error.message || 'Template gagal membuat draf.', 'error');
        } finally {
          hideLoading();
        }
      });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const validation = validate();
        renderErrorState(form, validation.errors);
        if (!validation.isValid) {
          toast('Periksa kembali data dan sumber dokumen.', 'warning');
          return;
        }
        showLoading(document ? 'Menyimpan perubahan' : 'Membuat dokumen');
        try {
          if (document) {
            store.updateDocument(document.id, { ...validation.data, progress: Math.max(document.progress || 45, 75) });
          } else {
            const result = await mockApi.saveDocument({ ...validation.data, progress: 55 });
            store.addDocument(result);
          }
          store.setState({ draft: null });
          closeModal();
          toast(document ? 'Dokumen berhasil diperbarui.' : 'Dokumen baru berhasil dibuat.', 'success');
          window.dispatchEvent(new CustomEvent('retralabs:documents-changed'));
        } catch (error) {
          toast(error.message || 'Dokumen gagal disimpan.', 'error');
        } finally {
          hideLoading();
        }
      });

      selectedDocs().forEach(inheritMetadata);
      syncMasterRefs();
      ensureUnits();
      renderSources();
      renderUnits();
      updateTotalWarning();
    },
  });
};
