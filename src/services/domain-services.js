import { apiClient } from './api-client.js';
import { createCrudService } from './crud-service.js';

export const userService = createCrudService('/users');
export const schoolService = createCrudService('/schools');
export const membershipService = {
  listBySchool: (schoolId, query = {}) => apiClient.get(`/schools/${encodeURIComponent(schoolId)}/memberships`, { query }),
  update: (schoolId, id, payload) => apiClient.patch(`/schools/${encodeURIComponent(schoolId)}/memberships/${encodeURIComponent(id)}`, payload),
  remove: (schoolId, id) => apiClient.delete(`/schools/${encodeURIComponent(schoolId)}/memberships/${encodeURIComponent(id)}`),
};
export const teacherService = createCrudService('/tenant/teachers');
export const subjectService = createCrudService('/tenant/subjects');
export const classroomService = createCrudService('/tenant/classrooms');
export const academicYearService = createCrudService('/tenant/academic-years');
export const semesterService = createCrudService('/tenant/semesters');
export const auditLogService = createCrudService('/audit-logs');
export const approvalRequestService = {
  ...createCrudService('/approval-requests'),
  approve: (id, payload = {}) => apiClient.patch(`/approval-requests/${encodeURIComponent(id)}/approve`, payload),
  requestRevision: (id, payload = {}) => apiClient.patch(`/approval-requests/${encodeURIComponent(id)}/request-revision`, payload),
  cancel: (id, payload = {}) => apiClient.patch(`/approval-requests/${encodeURIComponent(id)}/cancel`, payload),
};
export const subscriptionPlanService = createCrudService('/subscription-plans');
export const subscriptionService = {
  active: () => apiClient.get('/subscription'),
  checkout: (payload) => apiClient.post('/subscription/checkout', payload, { idempotencyKey: payload.idempotencyKey }),
  changePlan: (payload) => apiClient.post('/subscription/change-plan', payload, { idempotencyKey: payload.idempotencyKey }),
  cancel: (payload = {}) => apiClient.post('/subscription/cancel', payload),
  reactivate: (payload = {}) => apiClient.post('/subscription/reactivate', payload),
  history: (query = {}) => apiClient.get('/subscription/history', { query }),
};
export const paymentService = {
  ...createCrudService('/payments'),
  cancel: (id, payload = {}) => apiClient.post(`/payments/${encodeURIComponent(id)}/cancel`, payload),
};
export const usageService = {
  summary: (query = {}) => apiClient.get('/usage', { query }),
  quota: () => apiClient.get('/billing/quota'),
};
export const aiService = {
  list: (query = {}) => apiClient.get('/ai/generations', { query }),
  get: (id) => apiClient.get(`/ai/generations/${encodeURIComponent(id)}`),
  create: (payload) => apiClient.post('/ai/generations', payload, { idempotencyKey: payload.idempotencyKey }),
  cancel: (id, payload = {}) => apiClient.patch(`/ai/generations/${encodeURIComponent(id)}/cancel`, payload),
  apply: (id, payload = {}) => apiClient.patch(`/ai/generations/${encodeURIComponent(id)}/apply`, payload),
  improveDocument: (id, payload) => apiClient.post(`/documents/${encodeURIComponent(id)}/ai/improve`, payload),
  summarizeDocument: (id, payload) => apiClient.post(`/documents/${encodeURIComponent(id)}/ai/summarize`, payload),
  reviewSuggestions: (id, payload) => apiClient.post(`/documents/${encodeURIComponent(id)}/ai/review-suggestions`, payload),
  promptTemplates: (query = {}) => apiClient.get('/ai/prompt-templates', { query }),
};
export const notificationService = {
  list: (query = {}) => apiClient.get('/notifications', { query }),
  unreadCount: () => apiClient.get('/notifications/unread-count'),
  markRead: (id) => apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`, {}),
  readAll: () => apiClient.patch('/notifications/read-all', {}),
  remove: (id) => apiClient.delete(`/notifications/${encodeURIComponent(id)}`),
  archive: (id) => apiClient.patch(`/notifications/${encodeURIComponent(id)}/archive`, {}),
};
