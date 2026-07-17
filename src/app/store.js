import { documents as demoDocuments, schoolProfile } from '../data/demo.js';
import { APP_VERSION, STORAGE_SCHEMA_VERSION, generateDocumentCode, getDocumentCode, normalizeIds, subjectCode } from '../utils/workflow.js';

const STORAGE_KEY = 'retralabs-edu-state-v1';

const initialState = {
  appVersion: APP_VERSION,
  schemaVersion: STORAGE_SCHEMA_VERSION,
  theme: 'dark',
  sidebarOpen: false,
  isAuthenticated: true,
  documents: demoDocuments,
  school: schoolProfile,
  activeAcademicYear: schoolProfile.academicYear,
  activeSemester: schoolProfile.semester,
  draft: null,
};

const normalizeDocumentCode = (document) => {
  const code = getDocumentCode(document);
  if (code === 'TP-MAPEL-E-04' && document.subject === 'Informatika') return 'TP-INF-E-04';
  if (code.includes('-MAPEL-')) return code.replace('-MAPEL-', `-${subjectCode(document.subject)}-`);
  return code;
};

const migrateDocuments = (documents = []) => {
  let changed = false;
  const normalized = documents.map((document) => {
    const next = {
      ...document,
      status: document.status || 'draft',
      progress: Number(document.progress || 45),
      academicYear: document.academicYear || schoolProfile.academicYear,
      semester: document.semester || (document.type === 'PROTA' ? 'Tahunan' : schoolProfile.semester),
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
  const merged = {
    ...initialState,
    ...saved,
    appVersion: APP_VERSION,
    schemaVersion: STORAGE_SCHEMA_VERSION,
    documents: Array.isArray(saved.documents) ? saved.documents : initialState.documents,
    school: { ...initialState.school, ...(saved.school || {}) },
  };
  const migrated = migrateDocuments(merged.documents);
  return {
    state: { ...merged, documents: migrated.documents },
    changed: migrated.changed || saved.appVersion !== APP_VERSION || saved.schemaVersion !== STORAGE_SCHEMA_VERSION,
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
    state = structuredClone(initialState);
    persist();
    listeners.forEach((listener) => listener(this.getState()));
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
