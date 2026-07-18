import { normalizeIds } from '../utils/workflow.js';

export const unwrapList = (result) => {
  const data = result?.data ?? result ?? [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data.documents)) return data.documents;
  if (Array.isArray(data.notifications)) return data.notifications;
  if (Array.isArray(data.payments)) return data.payments;
  if (Array.isArray(data.generations)) return data.generations;
  if (Array.isArray(data.auditLogs)) return data.auditLogs;
  return [];
};

export const unwrapMeta = (result) => {
  const meta = result?.meta || result?.data?.meta || {};
  return {
    page: Number(meta.page || 1),
    limit: Number(meta.limit || 20),
    total: Number(meta.total || 0),
    totalPages: Number(meta.totalPages || meta.pages || 1),
  };
};

export const normalizeDocumentFromApi = (document = {}) => ({
  ...document,
  id: document.id || document.documentId || document.uuid,
  code: document.code || document.displayCode || document.documentCode || '',
  title: document.title || document.name || 'Tanpa Judul',
  type: document.type || document.documentType || 'RPP',
  status: String(document.status || document.workflowStatus || 'draft').toLowerCase(),
  subject: document.subject || document.subjectName || document.subject?.name || '',
  className: document.className || document.classroomName || document.classroom?.name || '',
  phase: document.phase || '',
  academicYear: document.academicYear || document.academicYearName || '',
  semester: document.semester || document.semesterName || '',
  schoolId: document.schoolId || document.activeSchoolId || document.school?.id || '',
  educationLevel: document.educationLevel || document.school?.educationLevel || '',
  teacherId: document.teacherId || document.teacher?.id || '',
  subjectId: document.subjectId || document.subject?.id || '',
  classroomId: document.classroomId || document.classroom?.id || '',
  sourceIds: normalizeIds(document.sourceIds || document.sourceDocumentIds || document.sources?.map((item) => item.id) || []),
  referenceIds: normalizeIds(document.referenceIds || document.sourceIds || document.sourceDocumentIds || []),
  progress: Number(document.progress || (document.status === 'APPROVED' ? 100 : 55)),
  revision: document.revision || document.version || 1,
  updatedAt: document.updatedAt || document.createdAt || new Date().toISOString(),
});

export const normalizeDocumentPayload = (payload = {}) => ({
  ...payload,
  sourceDocumentIds: normalizeIds(payload.sourceIds || payload.referenceIds || payload.sourceDocumentIds || []),
});
