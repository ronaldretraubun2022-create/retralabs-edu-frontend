import { renderApiListPage } from './apiListPage.js';
import { usageService } from '../services/domain-services.js';

export const renderUsage = () => renderApiListPage({
  path: '/usage',
  title: 'Usage',
  subtitle: 'Ringkasan penggunaan AI, storage, dan quota',
  service: usageService.summary,
  emptyTitle: 'Belum ada usage',
  columns: [
    { label: 'Metric', field: 'metric' },
    { label: 'Used', field: 'used' },
    { label: 'Limit', field: 'limit' },
    { label: 'Remaining', field: 'remaining' },
    { label: 'Periode', field: 'period' },
  ],
});
