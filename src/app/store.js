import { documents as demoDocuments, schoolProfile } from '../data/demo.js';
import { APP_VERSION, STORAGE_SCHEMA_VERSION, generateDocumentCode, getDocumentCode, normalizeIds, subjectCode } from '../utils/workflow.js';
import { DEFAULT_SCHOOL_ID, getActiveSchool, phase2DocumentSeeds, phase3DocumentSeeds, resolveDocumentMasterRefs, schoolSeeds } from '../utils/education.js';
import { defaultPrintSettings, normalizePrintSettings } from '../utils/printConfig.js';
import { defaultCalendarEvents, normalizeCalendarEvents } from '../utils/academicCalendar.js';
import { defaultUiPreferences, normalizeUiPreferences } from '../utils/productionUi.js';
import { safeStorage } from '../utils/safeStorage.js';

const STORAGE_KEY = 'retralabs-edu-state-v1';
const MIGRATION_VERSION = '1.8.0';
const MIGRATION_MARKER_KEY = 'retralabs-edu-migration-1.8.0';
const MIGRATION_BACKUP_KEY = 'retralabs-edu-state-backup-before-1.8.0';
const MIGRATION_REPORT_KEY = 'retralabs-edu-migration-report-1.8.0';
const TRANSIENT_KEYS = new Set([
  'auth',
  'user',
  'role',
  'activeSchool',
  'permissions',
  'featureFlags',
  'subscription',
  'quota',
  'notifications',
  'api',
  'loading',
  'backendVersion',
]);

const initialState = {
  appVersion: APP_VERSION,
  schemaVersion: STORAGE_SCHEMA_VERSION,
  theme: 'dark',
  sidebarOpen: false,
  isAuthenticated: false,
  loading: {
    bootstrap: false,
    route: false,
  },
  auth: {
    status: 'unknown',
    sessionExpired: false,
    lastError: null,
  },
  user: null,
  role: null,
  activeSchool: null,
  permissions: [],
  featureFlags: {},
  subscription: null,
  quota: null,
  notifications: {
    unreadCount: 0,
  },
  api: {
    online: false,
    reachable: false,
    checking: false,
    fallbackMode: false,
    lastError: null,
    requestId: null,
  },
  backendVersion: null,
  documents: demoDocuments,
  schools: schoolSeeds,
  activeSchoolId: DEFAULT_SCHOOL_ID,
  school: { ...schoolProfile, id: DEFAULT_SCHOOL_ID, level: 'SMK', educationLevel: 'SMK' },
  activeAcademicYear: schoolProfile.academicYear,
  activeSemester: schoolProfile.semester,
  printSettings: defaultPrintSettings,
  academicCalendarEvents: defaultCalendarEvents,
  uiPreferences: defaultUiPreferences,
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
    uiPreferences: normalizeUiPreferences(saved.uiPreferences || initialState.uiPreferences),
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
      JSON.stringify(saved.uiPreferences || {}) !== JSON.stringify(merged.uiPreferences) ||
      JSON.stringify(saved.schools || []) !== JSON.stringify(schools),
  };
};

const stripTransientState = (value) => {
  const clean = { ...value };
  TRANSIENT_KEYS.forEach((key) => delete clean[key]);
  clean.isAuthenticated = false;
  return clean;
};

const readState = () => {
  try {
    const raw = safeStorage.getRaw(STORAGE_KEY);
    const saved = safeStorage.getJson(STORAGE_KEY, {});
    if (raw && saved.schemaVersion !== STORAGE_SCHEMA_VERSION && !safeStorage.has(MIGRATION_BACKUP_KEY)) {
      safeStorage.setRaw(MIGRATION_BACKUP_KEY, raw);
    }
    const migrated = migrateState(saved);
    if (migrated.changed) {
      const report = {
        version: MIGRATION_VERSION,
        migratedAt: new Date().toISOString(),
        previousVersion: saved.schemaVersion || saved.appVersion || null,
        counts: {
          documents: migrated.state.documents.length,
          schools: migrated.state.schools.length,
          localDraft: migrated.state.draft ? 1 : 0,
        },
        succeeded: migrated.state.documents.map((document) => ({ id: document.id, code: document.code || null })),
        failed: [],
      };
      safeStorage.setJson(MIGRATION_REPORT_KEY, report);
      safeStorage.setJson(MIGRATION_MARKER_KEY, { version: MIGRATION_VERSION, migratedAt: report.migratedAt });
      safeStorage.setJson(STORAGE_KEY, stripTransientState(migrated.state));
    }
    return migrated.state;
  } catch {
    return migrateState({}).state;
  }
};

let state = readState();
const listeners = new Set();

const persist = () => {
  safeStorage.setJson(STORAGE_KEY, stripTransientState(state));
};

const normalizeBootstrapSchool = (item = {}) => item.school || item;

const normalizeBootstrap = (payload = {}) => {
  const data = payload.data || payload;
  const activeSchool = data.activeSchool || data.school || null;
  const schools = Array.isArray(data.schools) ? data.schools.map(normalizeBootstrapSchool).filter(Boolean) : [];
  return {
    user: data.user || null,
    activeSchool,
    schools,
    role: data.role || data.membership?.role || null,
    permissions: Array.isArray(data.permissions) ? data.permissions : [],
    featureFlags: data.featureFlags || data.features || {},
    subscription: data.subscription || { plan: 'FREE', status: 'fallback' },
    quota: data.quota || null,
    notifications: {
      unreadCount: Number(data.unreadNotificationCount ?? data.notifications?.unreadCount ?? 0),
    },
    backendVersion: data.backendVersion || data.version || null,
  };
};

const normalizeSchoolForUi = (school = {}) => ({
  ...initialState.school,
  ...school,
  id: school.id || school.schoolId || DEFAULT_SCHOOL_ID,
  name: school.name || school.schoolName || initialState.school.name,
  level: school.educationLevel || school.level || initialState.school.educationLevel,
  educationLevel: school.educationLevel || school.level || initialState.school.educationLevel,
  academicYear: school.academicYear || initialState.school.academicYear,
  semester: school.semester || initialState.school.semester,
});

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

  getLocalMigrationPreview() {
    const current = this.getState();
    return {
      version: MIGRATION_VERSION,
      hasBackup: safeStorage.has(MIGRATION_BACKUP_KEY),
      marker: safeStorage.getJson(MIGRATION_MARKER_KEY, null),
      counts: {
        documents: current.documents.length,
        schools: current.schools.length,
        localDraft: current.draft ? 1 : 0,
      },
    };
  },

  getLocalMigrationReport() {
    return safeStorage.getJson(MIGRATION_REPORT_KEY, null);
  },

  backupLocalState() {
    const storedState = safeStorage.getJson(STORAGE_KEY, null);
    const backup = {
      version: MIGRATION_VERSION,
      createdAt: new Date().toISOString(),
      storageKey: STORAGE_KEY,
      state: storedState || stripTransientState(state),
    };
    safeStorage.setJson(MIGRATION_BACKUP_KEY, backup);
    return backup;
  },

  applyBootstrap(payload, requestId = null) {
    const boot = normalizeBootstrap(payload);
    const normalizedSchools = boot.schools.length ? boot.schools.map(normalizeSchoolForUi) : state.schools;
    const activeSchool = boot.activeSchool ? normalizeSchoolForUi(boot.activeSchool) : normalizedSchools[0] || state.school;
    this.setState({
      isAuthenticated: true,
      auth: { status: 'authenticated', sessionExpired: false, lastError: null },
      user: boot.user,
      role: boot.role,
      activeSchool,
      schools: normalizedSchools,
      school: activeSchool,
      activeSchoolId: activeSchool.id,
      activeAcademicYear: activeSchool.academicYear,
      activeSemester: activeSchool.semester,
      permissions: boot.permissions,
      featureFlags: boot.featureFlags,
      subscription: boot.subscription,
      quota: boot.quota,
      notifications: boot.notifications,
      backendVersion: boot.backendVersion,
      api: { online: true, reachable: true, checking: false, fallbackMode: false, lastError: null, requestId },
    }, { persist: false });
  },

  setAuthError(error, fallbackMode = false) {
    const connectivityError = ['NETWORK_ERROR', 'REQUEST_TIMEOUT'].includes(error?.code);
    const reachable = Boolean(error?.status && !connectivityError);
    this.setState({
      isAuthenticated: fallbackMode,
      auth: {
        status: fallbackMode ? 'offline' : 'unauthenticated',
        sessionExpired: ['SESSION_REVOKED', 'ACCESS_TOKEN_EXPIRED', 'AUTHENTICATION_REQUIRED'].includes(error?.code),
        lastError: error
          ? {
              code: error.code,
              message: error.message,
              requestId: error.requestId,
              status: error.status,
              silentUnauthenticated: error.silentUnauthenticated === true,
            }
          : null,
      },
      api: {
        online: false,
        reachable,
        checking: false,
        fallbackMode,
        lastError: error
          ? {
              code: error.code,
              message: error.message,
              requestId: error.requestId,
              status: error.status,
              silentUnauthenticated: error.silentUnauthenticated === true,
            }
          : null,
        requestId: error?.requestId || null,
      },
    }, { persist: false });
  },

  setBackendConnection({ reachable, checking, error = undefined, requestId = undefined, backendVersion = null } = {}) {
    this.setState((current) => {
      const currentApi = { ...initialState.api, ...(current.api || {}) };
      const nextApi = { ...currentApi };
      const keepBootstrapOnline = current.auth?.status === 'authenticated' && currentApi.online === true;
      if (typeof checking === 'boolean') nextApi.checking = checking;
      if (typeof reachable === 'boolean') {
        nextApi.reachable = keepBootstrapOnline && !reachable ? true : reachable;
        if (!reachable && !keepBootstrapOnline) nextApi.online = false;
        if (reachable) nextApi.fallbackMode = false;
      }
      if (error !== undefined) {
        if (error && keepBootstrapOnline) {
          nextApi.checking = false;
        } else {
          nextApi.lastError = error
            ? {
                code: error.code,
                message: error.message,
                requestId: error.requestId,
                status: error.status,
                silentUnauthenticated: error.silentUnauthenticated === true,
              }
            : null;
          nextApi.requestId = error?.requestId || requestId || null;
        }
      } else if (requestId !== undefined) {
        nextApi.requestId = requestId || null;
      }
      return {
        backendVersion: backendVersion || current.backendVersion,
        api: nextApi,
      };
    }, { persist: false });
  },

  markBackendOnline({ requestId = null, backendVersion = null } = {}) {
    this.setState((current) => ({
      backendVersion: backendVersion || current.backendVersion,
      api: {
        ...initialState.api,
        ...(current.api || {}),
        online: true,
        reachable: true,
        checking: false,
        fallbackMode: false,
        lastError: null,
        requestId: requestId || current.api?.requestId || null,
      },
    }), { persist: false });
  },

  clearSession() {
    this.setState({
      isAuthenticated: false,
      auth: { status: 'unauthenticated', sessionExpired: false, lastError: null },
      user: null,
      role: null,
      activeSchool: null,
      permissions: [],
      featureFlags: {},
      subscription: null,
      quota: null,
      notifications: { unreadCount: 0 },
      api: { online: false, reachable: false, checking: false, fallbackMode: false, lastError: null, requestId: null },
      draft: null,
    }, { persist: false });
  },

  clearTenantCache() {
    this.setState({
      documents: [],
      draft: null,
      notifications: { unreadCount: 0 },
    }, { persist: false });
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
