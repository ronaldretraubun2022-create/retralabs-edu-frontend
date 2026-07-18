import { aiService } from '../services/domain-services.js';
import { documentService } from '../services/documents.js';
import { ApiError } from '../services/api-client.js';
import { normalizeDocumentFromApi, normalizeDocumentPayload } from './backend-mappers.js';
import { store } from './store.js';
import { canUseLocalFallback } from '../utils/backendStatus.js';
import { generateDocumentCode, normalizeIds } from '../utils/workflow.js';

const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldUseBackend = () => store.getState().api?.online === true;

const ensureLocalFallback = (code = 'NETWORK_ERROR', message = 'Backend tidak tersedia.') => {
  if (canUseLocalFallback(store.getState())) return;
  throw new ApiError({ code, message });
};

const localDocumentApi = {
  async saveDocument(payload) {
    await wait(650);
    if (!payload.title) throw new Error('Judul dokumen tidak boleh kosong.');
    const state = store.getState();
    const code = payload.code || generateDocumentCode({
      documents: state.documents,
      type: payload.type,
      subject: payload.subject,
      phase: payload.phase,
      academicYear: payload.academicYear,
      semester: payload.semester,
      schoolId: payload.schoolId,
      educationLevel: payload.educationLevel,
    });
    return {
      ...payload,
      id: `DOC-${Date.now().toString().slice(-6)}`,
      code,
      sourceIds: normalizeIds(payload.sourceIds || []),
      referenceIds: normalizeIds(payload.referenceIds || payload.sourceIds || []),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      progress: Number(payload.progress || 45),
    };
  },

  async generateWithAi(payload) {
    await wait(1000);
    if (!payload.subject || !payload.topic) {
      throw new Error('Mata pelajaran dan materi wajib dipilih.');
    }

    return {
      title: `${payload.type} ${payload.subject} — ${payload.topic}`,
      content: [
        `Dokumen ${payload.type} untuk ${payload.subject}.`,
        `Fase ${payload.phase}, kelas ${payload.className}.`,
        `Materi: ${payload.topic}.`,
        `Alokasi waktu: ${payload.duration || '2 JP'}.`,
        'Konten awal berhasil dibuat dan siap disunting oleh guru.',
      ].join('\n'),
    };
  },
};

export const documentWorkflowApi = {
  async saveDocument(payload) {
    if (shouldUseBackend()) {
      const result = await documentService.create(normalizeDocumentPayload(payload), {
        idempotencyKey: payload.idempotencyKey || `document-create-${Date.now()}`,
      });
      return normalizeDocumentFromApi(result.data);
    }
    ensureLocalFallback();
    return localDocumentApi.saveDocument(payload);
  },

  async updateDocument(id, payload) {
    if (shouldUseBackend()) {
      const result = await documentService.update(id, normalizeDocumentPayload(payload), {
        headers: payload.revision ? { 'If-Match': String(payload.revision) } : {},
      });
      return normalizeDocumentFromApi(result.data);
    }
    ensureLocalFallback();
    return { ...payload, id, updatedAt: new Date().toISOString() };
  },

  async generateTemplate(payload) {
    if (shouldUseBackend()) {
      const result = await aiService.create({
        feature: 'AI_GENERATION',
        type: 'DOCUMENT_DRAFT',
        input: payload,
        idempotencyKey: `ai-generation-${Date.now()}`,
      });
      return result.data;
    }
    ensureLocalFallback('FEATURE_NOT_AVAILABLE', 'AI membutuhkan backend aktif.');
    return localDocumentApi.generateWithAi(payload);
  },
};
