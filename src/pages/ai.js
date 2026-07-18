import { aiService } from '../services/domain-services.js';
import { renderApiListPage } from './apiListPage.js';

export const renderAi = () => renderApiListPage({
  path: '/ai',
  title: 'AI Generations',
  subtitle: 'Preview, apply, quota, status, dan error AI',
  service: aiService.list,
  emptyTitle: 'Belum ada job AI',
  columns: [
    { label: 'Feature', field: 'feature' },
    { label: 'Status', field: 'status' },
    { label: 'Estimasi Usage', field: 'estimatedUsage' },
    { label: 'Error', field: 'errorCode' },
    { label: 'Dibuat', field: 'createdAt' },
  ],
});
