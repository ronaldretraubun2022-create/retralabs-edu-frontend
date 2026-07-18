import { paymentService } from '../services/domain-services.js';
import { renderApiListPage } from './apiListPage.js';

export const renderPayments = () => renderApiListPage({
  path: '/payments',
  title: 'Payments',
  subtitle: 'Riwayat pembayaran dan status checkout',
  service: paymentService.list,
  emptyTitle: 'Belum ada pembayaran',
  columns: [
    { label: 'Provider', field: 'provider' },
    { label: 'Status', field: 'status' },
    { label: 'Nominal', field: 'amount' },
    { label: 'Currency', field: 'currency' },
    { label: 'Dibuat', field: 'createdAt' },
  ],
});
