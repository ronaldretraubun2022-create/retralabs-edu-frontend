import { documents as demoDocuments, schoolProfile } from '../data/demo.js';
import { APP_VERSION, STORAGE_SCHEMA_VERSION, generateDocumentCode, getDocumentCode, normalizeIds, subjectCode } from '../utils/workflow.js';
import { DEFAULT_SCHOOL_ID, getActiveSchool, phase2DocumentSeeds, phase3DocumentSeeds, resolveDocumentMasterRefs, schoolSeeds } from '../utils/education.js';
import { defaultPrintSettings, normalizePrintSettings } from '../utils/printConfig.js';
import { defaultCalendarEvents, normalizeCalendarEvents } from '../utils/academicCalendar.js';

const STORAGE_KEY = 'retralabs-edu-state-v1';

const initialState = {
  appVersion: APP_VERSION,
  schemaVersion: STORAGE_SCHEMA_VERSION,
  theme: 'dark',
  sidebarOpen: false,
  isAuthenticated: true,
  documents: demoDocuments,
  schools: schoolSeeds,
  activeSchoolId: DEFAULT_SCHOOL_ID,
  school: { ...schoolProfile, id: DEFAULT_SCHOOL_ID, level: 'SMK', educationLevel: 'SMK' },
  activeAcademicYear: schoolProfile.academicYear,
  activeSemester: schoolProfile.semester,
  printSettings: defaultPrintSettings,
  academicCalendarEvents: defaultCalendarEvents,
  draft: null,
};

const normalizeDocumentCode = (document) => {
  const code = getDocumentCode(document);
  if (code === 'TP-MAPEL-E-04' && document.subject === 'Informatika') return 'TP-INF-E-04';
  if (code.includes('-MAPEL-')) return code.replace('-MAPEL-', `-${subjectCode(document.subject, document.educationLevel)}-`);
  return code;
};

const migrateDocuments = (documents = [], { seedPhase2 = false } = {}) => {
  let changed = false;
  const existingSeedIds = new Set(documents.map((document) => document.id));
  const seededDocuments = [
    ...documents,
    ...(seedPhase2 ? phase2DocumentSeeds.filter((document) => !existingSeedIds.has(document.id)) : []),
    ...(seedPhase2 ? phase3DocumentSeeds.filter((document) => !existingSeedIds.has(document.id)) : []),
  ];
  if (seededDocuments.length !== documents.length) changed = true;

  const normalized = seededDocuments.map((document) => {
    const next = {
      ...document,
      status: document.status || 'draft',
      progress: Number(document.progress || 45),
      academicYear: document.academicYear || schoolProfile.academicYear,
      semester: document.semester || (document.type === 'PROTA' ? 'Tahunan' : schoolProfile.semester),
      schoolId: document.schoolId || DEFAULT_SCHOOL_ID,
      educationLevel: document.educationLevel || 'SMK',
      sourceIds: normalizeIds(document.sourceIds || document.referenceIds || []),
      referenceIds: normalizeIds(document.referenceIds || document.sourceIds || []),
    };
    const code = normalizeDocumentCode(next);
    if (code && code !== next.code) next.code = code;
    if (JSON.stringify(next) !== JSON.stringify(document)) changed = true;
    return next;
  });

  const codeToId = new Map();
  normalized.forEach((document) => {
    codeToId.set(getDocumentCode(document), document.id);
    if (document.code === 'TP-INF-E-04') codeToId.set('TP-MAPEL-E-04', document.id);
  });

  const usedCodes = new Set(normalized.map((document) => document.code).filter(Boolean));
  const withCodes = normalized.map((document) => {
    let code = document.code;
    if (!code || code === document.id) {
      code = generateDocumentCode({
        documents: normalized.filter((item) => item.id !== document.id && item.code),
        type: document.type,
        subject: document.subject,
        phase: document.phase,
        academicYear: document.academicYear,
        semester: document.semester,
        schoolId: document.schoolId,
        educationLevel: document.educationLevel,
        excludeId: document.id,
      });
      while (usedCodes.has(code)) {
        const number = Number(code.split('-').at(-1)) + 1;
        code = code.replace(/-\d+$/, `-${String(number).padStart(2, '0')}`);
      }
      usedCodes.add(code);
      changed = true;
    }
    const sourceIds = normalizeIds(document.sourceIds).map((id) => codeToId.get(id) || id);
    const referenceIds = normalizeIds(document.referenceIds).map((id) => codeToId.get(id) || id);
    if (JSON.stringify(sourceIds) !== JSON.stringify(document.sourceIds) || JSON.stringify(referenceIds) !== JSON.stringify(document.referenceIds)) changed = true;
    return { ...document, code, sourceIds: normalizeIds(sourceIds), referenceIds: normalizeIds(referenceIds) };
  });

  return { documents: withCodes, changed };
};

const migrateState = (saved = {}) => {
  const savedSchool = { ...initialState.school, ...(saved.school || {}) };
  const normalizedSavedSchool = {
    ...savedSchool,
    id: savedSchool.id || DEFAULT_SCHOOL_ID,
    level: savedSchool.educationLevel || savedSchool.level || 'SMK',
    educationLevel: savedSchool.educationLevel || savedSchool.level || 'SMK',
  };
  const schoolMap = new Map(schoolSeeds.map((school) => [school.id, school]));
  (Array.isArray(saved.schools) ? saved.schools : []).forEach((school) => {
    const level = school.educationLevel || school.level || 'SMK';
    schoolMap.set(school.id || (level === 'SMK' ? DEFAULT_SCHOOL_ID : `school-${level.toLowerCase()}`), {
      ...schoolSeeds.find((item) => item.educationLevel === level),
      ...school,
      id: school.id || (level === 'SMK' ? DEFAULT_SCHOOL_ID : `school-${level.toLowerCase()}`),
      level,
      educationLevel: level,
    });
  });
  schoolMap.set(normalizedSavedSchool.id, {
    ...schoolMap.get(normalizedSavedSchool.id),
    ...normalizedSavedSchool,
  });
  const schools = [...schoolMap.values()];
  const activeSchoolId = saved.activeSchoolId || normalizedSavedSchool.id || DEFAULT_SCHOOL_ID;
  const activeSchool = schools.find((school) => school.id === activeSchoolId) || schools.find((school) => school.id === DEFAULT_SCHOOL_ID) || schools[0];
  const merged = {
    ...initialState,
    ...saved,
    appVersion: APP_VERSION,
    schemaVersion: STORAGE_SCHEMA_VERSION,
    schools,
    activeSchoolId: activeSchool.id,
    documents: Array.isArray(saved.documents) ? saved.documents : initialState.documents,
    school: activeSchool,
    activeAcademicYear: saved.activeAcademicYear || activeSchool.academicYear,
    activeSemester: saved.activeSemester || activeSchool.semester,
    printSettings: normalizePrintSettings(saved.printSettings || initialState.printSettings),
    academicCalendarEvents: normalizeCalendarEvents(saved.academicCalendarEvents || initialState.academicCalendarEvents),
  };
  const migrated = migrateDocuments(merged.documents, {
    seedPhase2: saved.schemaVersion !== STORAGE_SCHEMA_VERSION || saved.appVersion !== APP_VERSION,
  });
  const documentsWithMasterRefs = migrated.documents.map((document) => ({
    ...document,
    ...resolveDocumentMasterRefs(document, schools),
  }));
  const masterRefsChanged = JSON.stringify(documentsWithMasterRefs) !== JSON.stringify(migrated.documents);
  return {
    state: { ...merged, documents: documentsWithMasterRefs },
    changed:
      migrated.changed ||
      masterRefsChanged ||
      saved.appVersion !== APP_VERSION ||
      saved.schemaVersion !== STORAGE_SCHEMA_VERSION ||
      saved.activeSchoolId !== activeSchool.id ||
      JSON.stringify(saved.printSettings || {}) !== JSON.stringify(merged.printSettings) ||
      JSON.stringify(saved.academicCalendarEvents || []) !== JSON.stringify(merged.academicCalendarEvents) ||
      JSON.stringify(saved.schools || []) !== JSON.stringify(schools),
  };
};

const readState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const migrated = migrateState(saved);
    if (migrated.changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated.state));
    return migrated.state;
  } catch {
    return migrateState({}).state;
  }
};

let state = readState();
const listeners = new Set();

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const store = {
  getState() {
    return structuredClone(state);
  },

  setState(patch, options = { persist: true }) {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
    if (options.persist !== false) persist();
    listeners.forEach((listener) => listener(this.getState()));
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  reset() {
    state = migrateState({}).state;
    persist();
    listeners.forEach((listener) => listener(this.getState()));
  },

  switchSchool(schoolId) {
    this.setState((current) => {
      const activeSchool = getActiveSchool({ ...current, activeSchoolId: schoolId });
      return {
        activeSchoolId: activeSchool.id,
        school: activeSchool,
        activeAcademicYear: activeSchool.academicYear,
        activeSemester: activeSchool.semester,
        draft: null,
      };
    });
  },

  addDocument(document) {
    this.setState((current) => ({ documents: [document, ...current.documents] }));
  },

  updateDocument(id, patch) {
    this.setState((current) => ({
      documents: current.documents.map((document) =>
        document.id === id ? { ...document, ...patch, updatedAt: new Date().toISOString() } : document,
      ),
    }));
  },

  deleteDocument(id) {
    this.setState((current) => ({
      documents: current.documents.filter((document) => document.id !== id),
    }));
  },
};
