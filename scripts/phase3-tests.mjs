import assert from 'node:assert/strict';

import { DEFAULT_SCHOOL_ID } from '../src/utils/education.js';
import { buildWorkflowIssues, getSourceDocuments } from '../src/utils/workflow.js';

const storageKey = 'retralabs-edu-state-v1';
const oldState = {
  appVersion: '1.4.0',
  schemaVersion: '1.4.0',
  activeSchoolId: DEFAULT_SCHOOL_ID,
  school: {
    id: DEFAULT_SCHOOL_ID,
    name: 'SMK Negeri 5 Agribisnis dan Agroteknologi Merauke',
    npsn: '69999999',
    level: 'SMK',
    educationLevel: 'SMK',
    academicYear: '2026/2027',
    semester: 'Ganjil',
  },
  documents: [
    {
      id: 'DOC-CP-INF-XATPH1-E-01',
      code: 'CP-INF-E-01',
      type: 'CP',
      title: 'CP Informatika',
      subject: 'Informatika',
      className: 'X ATPH 1',
      phase: 'E',
      schoolId: DEFAULT_SCHOOL_ID,
      educationLevel: 'SMK',
      teacher: 'Ronald Retraubun',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      elements: ['Berpikir komputasional'],
    },
    {
      id: 'DOC-ACP-INF-XATPH1-E-01',
      code: 'ACP-INF-E-01',
      type: 'ACP',
      title: 'ACP Informatika',
      subject: 'Informatika',
      className: 'X ATPH 1',
      phase: 'E',
      schoolId: DEFAULT_SCHOOL_ID,
      educationLevel: 'SMK',
      teacher: 'Ronald Retraubun',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      sourceIds: ['DOC-CP-INF-XATPH1-E-01'],
      referenceIds: ['DOC-CP-INF-XATPH1-E-01'],
    },
    {
      id: 'DOC-TP-INF-XATPH1-E-03',
      code: 'TP-INF-E-03',
      type: 'TP',
      title: 'Dekomposisi',
      subject: 'Informatika',
      className: 'X ATPH 1',
      phase: 'E',
      schoolId: DEFAULT_SCHOOL_ID,
      educationLevel: 'SMK',
      teacher: 'Ronald Retraubun',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      sourceIds: ['DOC-ACP-INF-XATPH1-E-01'],
      referenceIds: ['DOC-ACP-INF-XATPH1-E-01'],
    },
  ],
};

const bag = { [storageKey]: JSON.stringify(oldState) };
globalThis.localStorage = {
  getItem: (key) => bag[key] || null,
  setItem: (key, value) => {
    bag[key] = value;
  },
};

const { store } = await import('../src/app/store.js');

const migratedState = store.getState();
assert.equal(migratedState.appVersion, '2.0.0');
assert.equal(migratedState.schemaVersion, '2.0.0');

const cp = migratedState.documents.find((document) => document.id === 'DOC-CP-INF-XATPH1-E-01');
assert.equal(cp.teacherId, 'teacher-smk-ronald');
assert.equal(cp.subjectId, 'school-smk-merauke-subject-inf');
assert.equal(cp.classroomId, 'school-smk-merauke-class-x-atph-1');

const phase3Ids = [
  'DOC-PROTA-INF-XATPH1-E-01',
  'DOC-PROSEM-INF-XATPH1-E-01',
  'DOC-RPP-INF-XATPH1-E-01',
  'DOC-MODUL-INF-XATPH1-E-01',
  'DOC-KKTP-INF-XATPH1-E-01',
  'DOC-ASESMEN-INF-XATPH1-E-01',
];
phase3Ids.forEach((id) => assert.ok(migratedState.documents.some((document) => document.id === id), `${id} missing`));

const beforeSecondMigration = migratedState.documents.length;
store.setState((current) => ({ documents: current.documents }));
assert.equal(store.getState().documents.length, beforeSecondMigration);
assert.equal(new Set(migratedState.documents.map((document) => document.id)).size, migratedState.documents.length);

const matchingTpSources = getSourceDocuments(migratedState.documents, {
  type: 'ATP',
  schoolId: DEFAULT_SCHOOL_ID,
  educationLevel: 'SMK',
  teacherId: 'teacher-smk-ronald',
  subjectId: 'school-smk-merauke-subject-inf',
  classroomId: 'school-smk-merauke-class-x-atph-1',
  subject: 'Informatika',
  className: 'X ATPH 1',
  phase: 'E',
  academicYear: '2026/2027',
  semester: 'Ganjil',
});
assert.ok(matchingTpSources.some((document) => document.id === 'DOC-TP-INF-XATPH1-E-03'));

const wrongTeacherSources = getSourceDocuments(migratedState.documents, {
  type: 'ATP',
  schoolId: DEFAULT_SCHOOL_ID,
  educationLevel: 'SMK',
  teacherId: 'teacher-smk-agri',
  subjectId: 'school-smk-merauke-subject-inf',
  classroomId: 'school-smk-merauke-class-x-atph-1',
  subject: 'Informatika',
  className: 'X ATPH 1',
  phase: 'E',
  academicYear: '2026/2027',
  semester: 'Ganjil',
});
assert.equal(wrongTeacherSources.length, 0);

const prosem = migratedState.documents.find((document) => document.id === 'DOC-PROSEM-INF-XATPH1-E-01');
assert.deepEqual(buildWorkflowIssues(prosem, migratedState.documents), []);

const assessment = migratedState.documents.find((document) => document.id === 'DOC-ASESMEN-INF-XATPH1-E-01');
assert.deepEqual(buildWorkflowIssues(assessment, migratedState.documents), []);

assert.equal(migratedState.documents.some((document) => String(document.code || '').includes('MAPEL')), false);

console.log('Phase 3 tests passed.');
