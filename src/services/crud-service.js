import { apiClient } from './api-client.js';

export const createCrudService = (basePath) => ({
  list: (query = {}, options = {}) => apiClient.get(basePath, { ...options, query }),
  get: (id, options = {}) => apiClient.get(`${basePath}/${encodeURIComponent(id)}`, options),
  create: (payload, options = {}) => apiClient.post(basePath, payload, options),
  update: (id, payload, options = {}) => apiClient.patch(`${basePath}/${encodeURIComponent(id)}`, payload, options),
  remove: (id, options = {}) => apiClient.delete(`${basePath}/${encodeURIComponent(id)}`, options),
  restore: (id, options = {}) => apiClient.patch(`${basePath}/${encodeURIComponent(id)}/restore`, {}, options),
});
