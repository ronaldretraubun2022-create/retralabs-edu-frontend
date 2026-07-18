import { apiClient } from './api-client.js';

const HEALTH_TIMEOUT_MS = 5000;

const requestHealth = (path, options = {}) =>
  apiClient.get(path, {
    ...options,
    retryOnAuth: false,
    timeoutMs: options.timeoutMs || HEALTH_TIMEOUT_MS,
  });

export const backendHealthService = {
  async check(options = {}) {
    try {
      return await requestHealth('/health', options);
    } catch (error) {
      if (error?.status === 404 || error?.status === 405) {
        return requestHealth('/ready', options);
      }
      throw error;
    }
  },
};
