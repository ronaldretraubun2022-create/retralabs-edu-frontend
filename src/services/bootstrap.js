import { apiClient } from './api-client.js';

export const bootstrapService = {
  load: (options = {}) => apiClient.get('/bootstrap', options),
};
