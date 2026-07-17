import { store } from './store.js';
import { generateDocumentCode, normalizeIds } from '../utils/workflow.js';

const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
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
