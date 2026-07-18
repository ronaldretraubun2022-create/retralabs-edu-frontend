const MAX_STORAGE_BYTES = 1_500_000;
const SENSITIVE_KEY_PATTERN = /(access|auth|bearer|credential|password|secret|token)/i;
let lastStorageError = null;

const safeJsonParse = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const sanitizePersistedValue = (value, depth = 0) => {
  if (depth > 8) return null;
  if (Array.isArray(value)) return value.map((item) => sanitizePersistedValue(item, depth + 1)).filter((item) => item !== undefined);
  if (!value || typeof value !== 'object') return value;

  return Object.entries(value).reduce((clean, [key, item]) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) return clean;
    const next = sanitizePersistedValue(item, depth + 1);
    if (next !== undefined) clean[key] = next;
    return clean;
  }, {});
};

export const storageAvailable = () => {
  try {
    const key = '__retralabs_storage_check__';
    localStorage.setItem(key, '1');
    localStorage.removeItem?.(key);
    lastStorageError = null;
    return true;
  } catch (error) {
    lastStorageError = { code: 'STORAGE_UNAVAILABLE', message: error?.message || 'localStorage tidak tersedia.' };
    return false;
  }
};

export const getLastStorageError = () => lastStorageError;

export const safeStorage = {
  getRaw(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  getJson(key, fallback = null) {
    return safeJsonParse(this.getRaw(key), fallback);
  },

  setRaw(key, value) {
    if (!storageAvailable()) return false;
    try {
      localStorage.setItem(key, String(value));
      lastStorageError = null;
      return true;
    } catch (error) {
      lastStorageError = { code: 'STORAGE_WRITE_FAILED', message: error?.message || 'localStorage gagal ditulis.' };
      return false;
    }
  },

  setJson(key, value) {
    const sanitized = sanitizePersistedValue(value);
    const serialized = JSON.stringify(sanitized);
    if (serialized.length > MAX_STORAGE_BYTES) {
      lastStorageError = { code: 'STORAGE_CAPACITY_LIMIT', message: 'Data lokal melebihi batas aman penyimpanan.' };
      return false;
    }
    return this.setRaw(key, serialized);
  },

  has(key) {
    return this.getRaw(key) !== null;
  },
};
