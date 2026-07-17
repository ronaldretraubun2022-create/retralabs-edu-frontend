import assert from 'node:assert/strict';

import {
  DEFAULT_SCHOOL_ID,
  filterDocumentsBySchool,
  getActiveSchool,
  getPhaseForClass,
  schoolSeeds,
  validateSchoolClassPhase,
} from '../src/utils/education.js';
import { getSourceDocuments } from '../src/utils/workflow.js';

const storageKey = 'retralabs-edu-state-v1';
const oldState = {
  appVersion: '1.3.0',
  schemaVersion: '1.3.0',
  theme: 'dark',
  documents: [
    {
      id: 'DOC-TP-INF-XATPH1-E-04',
      code: 'TP-MAPEL-E-04',
      type: 'TP',
      title: 'Perancangan dan Evaluasi Algoritma',
      subject: 'Informatika',
      className: 'X ATPH 1',
      phase: 'E',
      academicYear: '2026/2027',
      semester: 'Ganjil',
    },
    {
      id: 'DOC-ATP-INF-XATPH1-E-02',
      code: 'ATP-INF-E-02',
      type: 'ATP',
      title: 'ATP Informatika X ATPH 1',
      subject: 'Informatika',
      className: 'X ATPH 1',
      phase: 'E',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      sourceIds: ['DOC-TP-INF-XATPH1-E-03', 'TP-MAPEL-E-04'],
      referenceIds: ['DOC-TP-INF-XATPH1-E-03', 'TP-MAPEL-E-04'],
    },
    {
      id: 'DOC-TP-INF-XATPH1-E-03',
      code: 'TP-INF-E-03',
      type: 'TP',
      title: 'Dekomposisi dan Pengenalan Pola',
      subject: 'Informatika',
      className: 'X ATPH 1',
      phase: 'E',
      academicYear: '2026/2027',
      semester: 'Ganjil',
    },
  ],
  school: {
    name: 'SMK Negeri 5 Agribisnis dan Agroteknologi Merauke',
    npsn: '69999999',
    level: 'SMK',
    academicYear: '2026/2027',
    semester: 'Ganjil',
  },
};

const bag = { [storageKey]: JSON.stringify(oldState) };
globalThis.localStorage = {
  getItem: (key) => bag[key] || null,
  setItem: (key, value) => {
    bag[key] = value;
  },
};

const { store } = await import('../src/app/store.js');

assert.equal(getPhaseForClass('SD', 'I A'), 'A');
assert.equal(getPhaseForClass('SD', 'IV A'), 'B');
assert.equal(getPhaseForClass('SD', 'VI A'), 'C');
assert.equal(getPhaseForClass('SMP', 'VII A'), 'D');
assert.equal(getPhaseForClass('SMA', 'X A'), 'E');
assert.equal(getPhaseForClass('SMA', 'XII A'), 'F');
assert.equal(getPhaseForClass('SMK', 'X ATPH 1'), 'E');
assert.equal(getPhaseForClass('SMK', 'XIII ATPH 1'), 'F');

const sdSchool = schoolSeeds.find((school) => school.educationLevel === 'SD');
assert.equal(validateSchoolClassPhase({ school: sdSchool, className: 'VII A', phase: 'D' }), 'Kelas VII A tidak tersedia untuk jenjang SD.');
assert.equal(validateSchoolClassPhase({ school: sdSchool, className: 'I A', phase: 'B' }), 'Fase B tidak sesuai. SD I A harus fase A.');

const migratedState = store.getState();
assert.equal(migratedState.appVersion, '1.7.0');
assert.equal(migratedState.schemaVersion, '1.7.0');
assert.equal(migratedState.schools.length, 4);
assert.equal(migratedState.school.educationLevel, 'SMK');

const migratedTp = migratedState.documents.find((document) => document.id === 'DOC-TP-INF-XATPH1-E-04');
const migratedAtp = migratedState.documents.find((document) => document.id === 'DOC-ATP-INF-XATPH1-E-02');
assert.equal(migratedTp.code, 'TP-INF-E-04');
assert.equal(migratedTp.schoolId, DEFAULT_SCHOOL_ID);
assert.equal(migratedAtp.sourceIds.includes('TP-MAPEL-E-04'), false);
assert.equal(migratedAtp.sourceIds.includes('DOC-TP-INF-XATPH1-E-04'), true);

const smkSources = getSourceDocuments(migratedState.documents, {
  type: 'ATP',
  subject: 'Informatika',
  className: 'X ATPH 1',
  phase: 'E',
  academicYear: '2026/2027',
  semester: 'Ganjil',
  schoolId: DEFAULT_SCHOOL_ID,
  educationLevel: 'SMK',
}).map((document) => document.code);
assert.deepEqual(smkSources.sort(), ['TP-INF-E-03', 'TP-INF-E-04']);

const sdSourcesLeakingIntoSmk = getSourceDocuments(migratedState.documents, {
  type: 'ATP',
  subject: 'Bahasa Indonesia',
  className: 'I A',
  phase: 'A',
  academicYear: '2026/2027',
  semester: 'Ganjil',
  schoolId: DEFAULT_SCHOOL_ID,
  educationLevel: 'SMK',
});
assert.equal(sdSourcesLeakingIntoSmk.length, 0);

store.switchSchool('school-sd-merauke');
const switchedState = store.getState();
assert.equal(getActiveSchool(switchedState).educationLevel, 'SD');
assert.ok(filterDocumentsBySchool(switchedState.documents, 'school-sd-merauke').length > 0);
assert.equal(filterDocumentsBySchool(switchedState.documents, DEFAULT_SCHOOL_ID).some((document) => document.educationLevel !== 'SMK'), false);

console.log('Phase 2 tests passed.');
