import { approvalRequestService } from '../services/domain-services.js';
import { renderApiListPage } from './apiListPage.js';

export const renderApprovals = () => renderApiListPage({
  path: '/approvals',
  title: 'Approval',
  subtitle: 'Request, keputusan, revisi, dan status approval dokumen',
  service: approvalRequestService.list,
  emptyTitle: 'Belum ada approval',
  columns: [
    { label: 'Dokumen', field: 'document.title' },
    { label: 'Status', field: 'status' },
    { label: 'Approver', field: 'approver.name' },
    { label: 'Catatan', field: 'decisionNote' },
    { label: 'Diperbarui', field: 'updatedAt' },
  ],
});
