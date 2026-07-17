import { schoolProfile } from '../data/demo.js';

export const APP_VERSION = '1.3.0';
export const STORAGE_SCHEMA_VERSION = '1.3.0';

export const documentTypes = ['CP', 'ACP', 'TP', 'ATP', 'PROTA', 'PROSEM', 'RPP', 'MODUL', 'KKTP', 'ASESMEN'];

export const subjectMaster = [
  { name: 'Bahasa Indonesia', code: 'BIND' },
  { name: 'Matematika', code: 'MTK' },
  { name: 'Informatika', code: 'INF' },
  { name: 'Dasar-Dasar Agribisnis Tanaman', code: 'DAT' },
  { name: 'Projek IPAS', code: 'IPAS' },
  { name: 'Sejarah', code: 'SEJ' },
  { name: 'Pendidikan Pancasila', code: 'PP' },
  { name: 'Bahasa Inggris', code: 'BING' },
];

export const statusConfig = {
  draft: ['Draf', 'badge-warning', 'FileClock'],
  review: ['Review', 'badge-info', 'Clock3'],
  revision: ['Perlu Revisi', 'badge-warning', 'MessageSquareWarning'],
  approved: ['Disetujui', 'badge-success', 'CircleCheck'],
  archived: ['Diarsipkan', 'badge-danger', 'Archive'],
};

export const workflowSources = {
  CP: [],
  ACP: ['CP'],
  TP: ['ACP'],
  ATP: ['TP'],
  PROTA: ['ATP'],
  PROSEM: ['PROTA'],
  RPP: ['PROSEM'],
  MODUL: ['PROSEM'],
  KKTP: ['TP', 'ATP'],
  ASESMEN: ['KKTP', 'TP'],
};

export const nextActions = {
  CP: [{ type: 'ACP', label: 'Buat ACP' }],
  ACP: [{ type: 'TP', label: 'Buat TP' }],
  TP: [{ type: 'ATP', label: 'Buat ATP' }, { type: 'KKTP', label: 'Buat KKTP' }],
  ATP: [{ type: 'PROTA', label: 'Buat PROTA' }, { type: 'KKTP', label: 'Buat KKTP' }],
  PROTA: [{ type: 'PROSEM', label: 'Buat PROSEM' }],
  PROSEM: [{ type: 'RPP', label: 'Buat RPP' }, { type: 'MODUL', label: 'Buat Modul Ajar' }],
  KKTP: [{ type: 'ASESMEN', label: 'Buat Asesmen' }],
};

export const subjectCode = (subject = '') => {
  const found = subjectMaster.find((item) => item.name === subject);
  if (found) return found.code;
  return String(subject || 'UMUM')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 6) || 'UMUM';
};

export const parseJp = (value) => {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
};

export const formatJp = (value) => `${Number(value || 0)} JP`;

export const normalizeIds = (ids = []) => [...new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean))];

export const sameMetadata = (left = {}, right = {}, includeSemester = true) => {
  const keys = ['subject', 'className', 'phase', 'academicYear'];
  if (includeSemester) keys.push('semester');
  return keys.every((key) => String(left[key] || '') === String(right[key] || ''));
};

export const getDocumentCode = (document = {}) => document.code || document.documentCode || document.id || '';

export const generateDocumentCode = ({
  documents = [],
  type,
  subject,
  phase,
  academicYear = schoolProfile.academicYear,
  semester = schoolProfile.semester,
  excludeId = '',
}) => {
  const mapelCode = subjectCode(subject);
  const prefix = `${type}-${mapelCode}-${phase || 'E'}-`;
  const activeDocs = documents.filter((item) =>
    item.id !== excludeId &&
    item.type === type &&
    item.subject === subject &&
    item.phase === phase &&
    (item.academicYear || schoolProfile.academicYear) === academicYear &&
    (item.semester || schoolProfile.semester) === semester
  );
  const maxNumber = activeDocs.reduce((max, item) => {
    const code = getDocumentCode(item);
    if (!code.startsWith(prefix)) return max;
    const number = Number(code.slice(prefix.length));
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);
  return `${prefix}${String(maxNumber + 1).padStart(2, '0')}`;
};

export const sourceTypesFor = (type) => workflowSources[type] || [];

export const isMultiSourceType = (type) => ['ATP', 'KKTP', 'ASESMEN'].includes(type);

export const getSourceDocuments = (documents = [], values = {}) => {
  const sourceTypes = sourceTypesFor(values.type);
  if (!sourceTypes.length) return [];
  return documents.filter((item) => {
    if (!sourceTypes.includes(item.type)) return false;
    if (item.status === 'archived') return false;
    const includeSemester = values.type !== 'PROTA';
    return ['subject', 'className', 'phase', 'academicYear']
      .every((key) => !values[key] || String(item[key] || '') === String(values[key] || '')) &&
      (!includeSemester || !values.semester || String(item.semester || '') === String(values.semester || ''));
  });
};

export const findByIdOrCode = (documents = [], value = '') =>
  documents.find((item) => item.id === value || getDocumentCode(item) === value);

export const childDocumentsOf = (documents = [], parentId = '') =>
  documents.filter((item) => normalizeIds([...(item.sourceIds || []), ...(item.referenceIds || [])]).includes(parentId));

export const inheritFromSource = (source = {}) => ({
  subject: source.subject || '',
  className: source.className || '',
  phase: source.phase || 'E',
  academicYear: source.academicYear || schoolProfile.academicYear,
  semester: source.semester || schoolProfile.semester,
  teacher: source.teacher || '',
});

export const titleForDocument = (values = {}) => {
  const subject = values.subject || 'Mata Pelajaran';
  const className = values.className || 'Kelas';
  if (values.type === 'PROTA') return `PROTA ${subject} ${className}`;
  if (values.type === 'PROSEM') return `PROSEM ${subject} ${className} ${values.semester || ''}`.trim();
  if (values.type === 'MODUL') return `Modul Ajar ${subject} ${className}`;
  if (values.type === 'ASESMEN') return `Asesmen ${subject} ${className}`;
  return `${values.type} ${subject} ${className}`;
};

export const buildWorkflowIssues = (document = {}, documents = []) => {
  const issues = [];
  const expectedSources = sourceTypesFor(document.type);
  const sourceIds = normalizeIds(document.sourceIds || document.referenceIds || []);
  if (expectedSources.length && !sourceIds.length) issues.push('Sumber dokumen belum dipilih.');

  sourceIds.forEach((sourceId) => {
    const source = findByIdOrCode(documents, sourceId);
    if (!source) {
      issues.push(`Sumber ${sourceId} tidak tersedia.`);
      return;
    }
    if (!expectedSources.includes(source.type)) issues.push(`Tipe sumber ${getDocumentCode(source)} harus ${expectedSources.join(' atau ')}.`);
    if (source.subject !== document.subject) issues.push(`Mata pelajaran berbeda dengan ${getDocumentCode(source)}.`);
    if (source.className !== document.className) issues.push(`Kelas berbeda dengan ${getDocumentCode(source)}.`);
    if (source.phase !== document.phase) issues.push(`Fase berbeda dengan ${getDocumentCode(source)}.`);
    if ((source.academicYear || '') !== (document.academicYear || '')) issues.push(`Tahun ajaran berbeda dengan ${getDocumentCode(source)}.`);
    if (document.type !== 'PROTA' && (source.semester || '') !== (document.semester || '')) issues.push(`Semester berbeda dengan ${getDocumentCode(source)}.`);
  });

  return [...new Set(issues)];
};
