import { escapeHtml, slugify } from './format.js';
import { educationPrintLabels, getPrintPageConfig } from './printConfig.js';
import { getDocumentCode } from './workflow.js';

const valueOrDash = (value) => escapeHtml(value || '-');

const row = (label, value) => `
  <tr>
    <td class="label">${escapeHtml(label)}</td>
    <td>${valueOrDash(value)}</td>
  </tr>
`;

const specialtyLabels = {
  teacherRole: 'Peran Guru',
  electiveGroup: 'Kelompok Pilihan',
  expertiseField: 'Bidang Keahlian',
  expertiseProgram: 'Program Keahlian',
  expertiseConcentration: 'Konsentrasi Keahlian',
  industryPartner: 'Mitra Dunia Kerja',
  certification: 'Sertifikasi',
};

const paragraphSection = (title, value) => value ? `
  <section class="doc-section">
    <h2>${escapeHtml(title)}</h2>
    <p>${escapeHtml(value)}</p>
  </section>
` : '';

const listSection = (title, items = []) => {
  const cleanItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!cleanItems.length) return '';
  return `
    <section class="doc-section">
      <h2>${escapeHtml(title)}</h2>
      <ol>
        ${cleanItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ol>
    </section>
  `;
};

const tableSection = (title, headers = [], rows = []) => {
  if (!rows.length) return '';
  return `
    <section class="doc-section table-block">
      <h2>${escapeHtml(title)}</h2>
      <table>
        <thead><tr>${headers.map((item) => `<th>${escapeHtml(item)}</th>`).join('')}</tr></thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </section>
  `;
};

const unitsRows = (units = []) => units.map((unit, index) => `
  <tr>
    <td>${index + 1}</td>
    <td>${valueOrDash(unit.title)}</td>
    <td>${valueOrDash(unit.tpId)}</td>
    <td>${valueOrDash(unit.jp)}</td>
    <td>${valueOrDash(unit.month)}</td>
    <td>${valueOrDash(unit.note)}</td>
  </tr>
`);

const scheduleRows = (schedules = []) => schedules.map((item, index) => `
  <tr>
    <td>${index + 1}</td>
    <td>${valueOrDash(item.month)}</td>
    <td>${valueOrDash(item.week)}</td>
    <td>${valueOrDash(item.title)}</td>
    <td>${valueOrDash(item.jp)}</td>
    <td>${valueOrDash(item.schedule)}</td>
    <td>${valueOrDash(item.assessment)}</td>
  </tr>
`);

const sourceRows = (document = {}) => (document.sourceIds || []).map((sourceId, index) => `
  <tr>
    <td>${index + 1}</td>
    <td>${valueOrDash(sourceId)}</td>
  </tr>
`);

export const buildDocumentFilename = (document = {}, extension = 'doc') =>
  `${slugify(getDocumentCode(document) || document.title || 'dokumen')}.${extension}`;

export const buildDocumentSections = (document = {}) => {
  const sections = [
    listSection('Elemen CP', document.elements),
    paragraphSection('Analisis CP', document.analysisNotes),
    paragraphSection('Elemen Turunan', document.derivedElements),
    paragraphSection('Tujuan Pembelajaran', document.learningObjectives),
    paragraphSection('Indikator TP', document.tpIndicators),
    paragraphSection('Rasional Alur', document.flowRationale),
    paragraphSection('Strategi Pembelajaran', document.learningStrategy),
    paragraphSection('Kegiatan Pembelajaran', document.learningActivities),
    paragraphSection('Rencana Asesmen', document.assessmentPlan),
    paragraphSection('Kriteria Ketercapaian', document.kktpCriteria),
    paragraphSection('Tindak Lanjut', document.followUpPlan),
    paragraphSection('Instruksi Peserta Didik', document.studentInstructions),
    tableSection('Sumber Dokumen', ['No', 'ID Sumber'], sourceRows(document)),
    tableSection('Unit / Materi', ['No', 'Unit', 'TP', 'JP', 'Bulan', 'Keterangan'], unitsRows(document.units || [])),
    tableSection('Distribusi Minggu Efektif', ['No', 'Bulan', 'Minggu', 'Unit', 'JP', 'Jadwal', 'Asesmen'], scheduleRows(document.schedules || [])),
    paragraphSection('Konten Dokumen', document.content),
  ];
  return sections.filter(Boolean).join('');
};

export const buildMetadataTable = (document = {}, school = {}) => {
  const labels = educationPrintLabels[document.educationLevel || school.educationLevel] || educationPrintLabels.SMK;
  const specialtyRows = labels.specialtyFields
    .map((field) => row(specialtyLabels[field] || field, document[field]))
    .join('');
  return `
    <table class="meta-table">
      <tbody>
        ${row('Kode Dokumen', getDocumentCode(document))}
        ${row('Jenis Dokumen', document.type)}
        ${row('Sekolah', school.name)}
        ${row('Jenjang', document.educationLevel || school.educationLevel)}
        ${row('Mata Pelajaran', document.subject)}
        ${row('Kelas', document.className)}
        ${row('Fase', document.phase)}
        ${row('Tahun Ajaran', document.academicYear)}
        ${row('Semester', document.semester)}
        ${row(labels.teacherLabel, document.teacher)}
        ${specialtyRows}
      </tbody>
    </table>
  `;
};

export const buildDocumentHtml = ({ document, school, settings = {}, mode = 'print' }) => {
  const page = getPrintPageConfig(document, settings);
  const paperWidth = page.orientation === 'landscape' ? page.paper.heightMm : page.paper.widthMm;
  const paperHeight = page.orientation === 'landscape' ? page.paper.widthMm : page.paper.heightMm;
  const signature = page.settings.showSignature ? `
    <section class="signature-grid">
      <div>
        <p>Mengetahui,</p>
        <p>Kepala Sekolah</p>
        <br><br><br>
        <p class="signature-name">${valueOrDash(school.principal)}</p>
        <p>NIP. ${valueOrDash(school.principalNip)}</p>
      </div>
      <div>
        <p>Merauke, ${new Date().toLocaleDateString('id-ID')}</p>
        <p>${valueOrDash(document.teacher || 'Guru Pengampu')}</p>
        <br><br><br>
        <p class="signature-name">${valueOrDash(document.teacher || 'Guru Pengampu')}</p>
      </div>
    </section>
  ` : '';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(document.title || getDocumentCode(document))}</title>
  <style>
    @page { size: ${paperWidth}mm ${paperHeight}mm; margin: ${page.margin.top}mm ${page.margin.right}mm ${page.margin.bottom}mm ${page.margin.left}mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111827; font-family: ${page.theme.fontFamily}; font-size: 11pt; line-height: 1.45; }
    .doc-shell { width: 100%; }
    .kop { display: grid; grid-template-columns: 1fr auto; gap: 16px; border-bottom: 3px solid ${page.theme.border}; padding-bottom: 12px; margin-bottom: 18px; }
    .kop h1 { margin: 0; font-size: 16pt; text-transform: uppercase; letter-spacing: .02em; }
    .kop p { margin: 3px 0; }
    .doc-code { color: ${page.theme.accent}; font-weight: 700; text-align: right; }
    h2 { font-size: 12pt; margin: 18px 0 8px; color: ${page.theme.accent}; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    th, td { border: 1px solid #6b7280; padding: 6px 7px; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 700; }
    .meta-table .label { width: 170px; font-weight: 700; background: #f8fafc; }
    .doc-title { margin: 18px 0 10px; text-align: center; }
    .doc-title h1 { margin: 0; font-size: 15pt; text-transform: uppercase; }
    .doc-section { page-break-inside: avoid; }
    .table-block { page-break-inside: auto; }
    ol { margin-top: 6px; padding-left: 22px; }
    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 40px; page-break-inside: avoid; }
    .signature-grid > div:last-child { text-align: left; }
    .signature-name { font-weight: 700; text-decoration: underline; margin-bottom: 0; }
    @media screen { body { background: #e5e7eb; padding: 24px; } .doc-shell { background: white; margin: 0 auto; padding: 28px; max-width: ${page.orientation === 'landscape' ? '1120px' : '820px'}; box-shadow: 0 18px 60px rgba(15,23,42,.18); } }
  </style>
</head>
<body data-print-mode="${escapeHtml(mode)}">
  <main class="doc-shell">
    <header class="kop">
      <div>
        <h1>${valueOrDash(school.name)}</h1>
        <p>${valueOrDash(school.address)}</p>
        <p>NPSN ${valueOrDash(school.npsn)} - ${valueOrDash(school.educationLevel || school.level)}</p>
      </div>
      <div class="doc-code">
        <p>${valueOrDash(page.paper.label)}</p>
        <p>${valueOrDash(page.orientation)}</p>
        <p>${valueOrDash(getDocumentCode(document))}</p>
      </div>
    </header>
    <section class="doc-title">
      <h1>${valueOrDash(document.title || getDocumentCode(document))}</h1>
    </section>
    ${buildMetadataTable(document, school)}
    ${buildDocumentSections(document)}
    ${signature}
  </main>
</body>
</html>`;
};
