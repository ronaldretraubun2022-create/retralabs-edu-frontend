import { store } from './store.js';

const normalizeList = (value) => (Array.isArray(value) ? value : []);

export const hasPermission = (permission) => {
  if (!permission) return true;
  const state = store.getState();
  return normalizeList(state.permissions).includes(permission);
};

export const hasAnyPermission = (permissions = []) => {
  const list = normalizeList(permissions);
  if (!list.length) return true;
  return list.some((permission) => hasPermission(permission));
};

export const hasFeature = (feature) => {
  if (!feature) return true;
  const flags = store.getState().featureFlags || {};
  if (Array.isArray(flags)) return flags.includes(feature);
  return flags[feature] !== false && Boolean(flags[feature]);
};

const routeRules = {
  '/dashboard': {},
  '/documents': { any: ['documents.read', 'document.read'] },
  '/approvals': { any: ['approval.read', 'documents.approve'] },
  '/notifications': { any: ['notifications.read', 'notification.read'] },
  '/ai': { feature: 'AI_GENERATION', any: ['ai.use', 'ai.jobs.read'] },
  '/subscription': { any: ['subscription.read', 'billing.read'] },
  '/payments': { any: ['payments.read', 'billing.read'] },
  '/usage': { any: ['usage.read', 'billing.read'] },
  '/audit': { any: ['audit.read', 'audit.logs.read'] },
  '/settings': {},
  '/settings/sessions': {},
  '/settings/migration': {},
  '/help': {},
};

const actionRules = {
  'document.create': { any: ['documents.create', 'document.create'] },
  'document.update': { any: ['documents.update', 'document.update'] },
  'document.delete': { any: ['documents.delete', 'document.delete'] },
  'document.review': { any: ['documents.review', 'approval.request'] },
  'document.approve': { any: ['documents.approve', 'approval.approve'] },
  'document.archive': { any: ['documents.archive', 'document.archive'] },
  'document.export': { any: ['documents.export', 'export.create'] },
  'ai.use': { feature: 'AI_GENERATION', any: ['ai.use'] },
};

const passesRule = (rule = {}) => {
  if (rule.feature && !hasFeature(rule.feature)) return false;
  if (rule.permission && !hasPermission(rule.permission)) return false;
  if (rule.any && !hasAnyPermission(rule.any)) return false;
  return true;
};

export const canAccessRoute = (route) => passesRule(routeRules[route] || {});

export const canPerformAction = (action) => passesRule(actionRules[action] || {});

export const routeAccessReason = (route) => {
  const rule = routeRules[route] || {};
  if (rule.feature && !hasFeature(rule.feature)) return 'Fitur belum tersedia pada paket aktif.';
  if ((rule.permission || rule.any) && !passesRule(rule)) return 'Akun tidak memiliki permission untuk menu ini.';
  return '';
};
