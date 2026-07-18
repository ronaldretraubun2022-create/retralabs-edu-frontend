import { auditLogService } from '../services/domain-services.js';
import { renderApiListPage } from './apiListPage.js';

export const renderAudit = () => renderApiListPage({
  path: '/audit',
  title: 'Audit Logs',
  subtitle: 'Jejak aktivitas tenant dan keamanan',
  service: auditLogService.list,
  emptyTitle: 'Belum ada audit log',
  columns: [
    { label: 'Action', field: 'action' },
    { label: 'Actor', field: 'actor.name' },
    { label: 'Resource', field: 'resourceType' },
    { label: 'Request ID', field: 'requestId' },
    { label: 'Waktu', field: 'createdAt' },
  ],
});
