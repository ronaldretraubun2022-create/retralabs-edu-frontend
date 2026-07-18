import { subscriptionPlanService } from '../services/domain-services.js';
import { renderApiListPage } from './apiListPage.js';

export const renderSubscription = () => renderApiListPage({
  path: '/subscription',
  title: 'Subscription',
  subtitle: 'Plan FREE, TEACHER_PRO, SCHOOL, SCHOOL_PLUS, dan ENTERPRISE',
  service: subscriptionPlanService.list,
  emptyTitle: 'Belum ada paket',
  columns: [
    { label: 'Paket', field: 'code' },
    { label: 'Harga', field: 'price' },
    { label: 'Periode', field: 'period' },
    { label: 'Max Users', field: 'maxUsers' },
    { label: 'AI Units', field: 'aiUnits' },
    { label: 'Storage', field: 'storageBytes' },
  ],
});
