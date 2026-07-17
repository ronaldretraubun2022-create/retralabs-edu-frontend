import { documents as demoDocuments, schoolProfile } from '../data/demo.js';

const STORAGE_KEY = 'retralabs-edu-state-v1';

const initialState = {
  theme: 'dark',
  sidebarOpen: false,
  isAuthenticated: true,
  documents: demoDocuments,
  school: schoolProfile,
  activeAcademicYear: schoolProfile.academicYear,
  activeSemester: schoolProfile.semester,
  draft: null,
};

const readState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      ...initialState,
      ...saved,
      documents: Array.isArray(saved.documents) ? saved.documents : initialState.documents,
      school: { ...initialState.school, ...(saved.school || {}) },
    };
  } catch {
    return { ...initialState };
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
