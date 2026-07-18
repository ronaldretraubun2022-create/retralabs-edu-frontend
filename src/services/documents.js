import { apiClient } from './api-client.js';
import { createCrudService } from './crud-service.js';

export const documentService = {
  ...createCrudService('/documents'),
  submitReview: (id, payload = {}) => apiClient.patch(`/documents/${encodeURIComponent(id)}/submit-review`, payload),
  requestRevision: (id, payload = {}) => apiClient.patch(`/documents/${encodeURIComponent(id)}/request-revision`, payload),
  approve: (id, payload = {}) => apiClient.patch(`/documents/${encodeURIComponent(id)}/approve`, payload),
  archive: (id, payload = {}) => apiClient.patch(`/documents/${encodeURIComponent(id)}/archive`, payload),
  sources: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/sources`, { query }),
  children: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/children`, { query }),
  relations: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/relations`, { query }),
  createRelation: (id, payload) => apiClient.post(`/documents/${encodeURIComponent(id)}/relations`, payload),
  reorderRelations: (id, payload) => apiClient.patch(`/documents/${encodeURIComponent(id)}/relations/reorder`, payload),
  deleteRelation: (id, relationId) => apiClient.delete(`/documents/${encodeURIComponent(id)}/relations/${encodeURIComponent(relationId)}`),
  versions: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/versions`, { query }),
  version: (id, versionId) => apiClient.get(`/documents/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}`),
  compareVersions: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/versions/compare`, { query }),
  restoreVersion: (id, versionId, payload = {}) => apiClient.patch(`/documents/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}/restore`, payload),
  approvalRequests: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/approval-requests`, { query }),
  comments: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/comments`, { query }),
  createComment: (id, payload) => apiClient.post(`/documents/${encodeURIComponent(id)}/comments`, payload),
  updateComment: (id, commentId, payload) => apiClient.patch(`/documents/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}`, payload),
  deleteComment: (id, commentId) => apiClient.delete(`/documents/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}`),
  resolveComment: (id, commentId) => apiClient.patch(`/documents/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}/resolve`, {}),
  reopenComment: (id, commentId) => apiClient.patch(`/documents/${encodeURIComponent(id)}/comments/${encodeURIComponent(commentId)}/reopen`, {}),
  attachments: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/attachments`, { query }),
  uploadAttachment: (id, formData, options = {}) => apiClient.post(`/documents/${encodeURIComponent(id)}/attachments`, formData, options),
  exports: (id, query = {}) => apiClient.get(`/documents/${encodeURIComponent(id)}/exports`, { query }),
  createExport: (id, payload) => apiClient.post(`/documents/${encodeURIComponent(id)}/exports`, payload, { idempotencyKey: payload.idempotencyKey }),
};

export const attachmentService = {
  get: (id) => apiClient.get(`/attachments/${encodeURIComponent(id)}`),
  download: (id) => apiClient.get(`/attachments/${encodeURIComponent(id)}/download`, { responseType: 'blob' }),
  restore: (id) => apiClient.patch(`/attachments/${encodeURIComponent(id)}/restore`, {}),
  remove: (id) => apiClient.delete(`/attachments/${encodeURIComponent(id)}`),
};

export const exportService = {
  get: (id) => apiClient.get(`/exports/${encodeURIComponent(id)}`),
  download: (id) => apiClient.get(`/exports/${encodeURIComponent(id)}/download`, { responseType: 'blob' }),
};
