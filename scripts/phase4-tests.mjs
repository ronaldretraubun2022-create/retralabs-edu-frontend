import assert from 'node:assert/strict';

import { schoolSeeds } from '../src/utils/education.js';
import { buildDocumentHtml } from '../src/utils/documentTemplates.js';
import {
  defaultPrintSettings,
  getPrintPageConfig,
  normalizePrintSettings,
  paperConfigs,
  shouldUseLandscape,
} from '../src/utils/printConfig.js';
import {
  defaultCalendarEvents,
  getCalendarEventsForSchool,
  normalizeCalendarEvents,
} from '../src/utils/academicCalendar.js';
import { buildAcademicCalendarHtml } from '../src/utils/printEngine.js';

const storageKey = 'retralabs-edu-state-v1';
const smkSchool = schoolSeeds.find((school) => school.educationLevel === 'SMK');
const sdSchool = schoolSeeds.find((school) => school.educationLevel === 'SD');

assert.deepEqual(Object.keys(paperConfigs).sort(), ['A4', 'F4']);
assert.equal(normalizePrintSettings({ paperSize: 'Letter', theme: 'unknown', margin: 'thin', orientationMode: 'diagonal' }).paperSize, defaultPrintSettings.paperSize);
assert.equal(shouldUseLandscape({ type: 'RPP', units: [{ title: 'Unit 1' }] }), false);
assert.equal(shouldUseLandscape({ type: 'PROSEM' }), true);
assert.equal(getPrintPageConfig({ type: 'PROSEM' }, { paperSize: 'A4', orientationMode: 'auto' }).orientation, 'landscape');
assert.equal(getPrintPageConfig({ type: 'PROSEM' }, { orientationMode: 'portrait' }).orientation, 'portrait');

const sdHtml = buildDocumentHtml({
  document: {
    id: 'DOC-SD-RPP-01',
    code: 'RPP-BINDO-A-01',
    type: 'RPP',
    title: 'Modul Bahasa Indonesia SD',
    educationLevel: 'SD',
    subject: 'Bahasa Indonesia',
    className: 'I A',
    phase: 'A',
    academicYear: sdSchool.academicYear,
    semester: sdSchool.semester,
    teacher: 'Guru Kelas SD',
    teacherRole: 'Guru Kelas',
    expertiseField: 'Tidak boleh tampil',
    industryPartner: 'Tidak boleh tampil',
  },
  school: sdSchool,
});
assert.match(sdHtml, /Guru Kelas \/ Guru Mapel/);
assert.match(sdHtml, /Peran Guru/);
assert.doesNotMatch(sdHtml, /Bidang Keahlian/);
assert.doesNotMatch(sdHtml, /Mitra Dunia Kerja/);
assert.doesNotMatch(sdHtml, /Tidak boleh tampil/);

const smkHtml = buildDocumentHtml({
  document: {
    id: 'DOC-SMK-RPP-01',
    code: 'RPP-INF-E-01',
    type: 'RPP',
    title: 'Modul Informatika SMK',
    educationLevel: 'SMK',
    subject: 'Informatika',
    className: 'X ATPH 1',
    phase: 'E',
    academicYear: smkSchool.academicYear,
    semester: smkSchool.semester,
    teacher: 'Guru Produktif',
    expertiseField: 'Agribisnis dan Agroteknologi',
    expertiseProgram: 'Agribisnis Tanaman',
    expertiseConcentration: 'ATPH',
    industryPartner: 'PT Dunia Kerja',
    certification: 'Sertifikasi Internal',
  },
  school: smkSchool,
});
assert.match(smkHtml, /Bidang Keahlian/);
assert.match(smkHtml, /Agribisnis dan Agroteknologi/);
assert.match(smkHtml, /Mitra Dunia Kerja/);

const duplicatedCalendar = normalizeCalendarEvents([...defaultCalendarEvents, ...defaultCalendarEvents]);
assert.equal(duplicatedCalendar.length, defaultCalendarEvents.length);

const mixedEvents = [
  ...defaultCalendarEvents,
  {
    id: 'cal-sd-private',
    schoolId: sdSchool.id,
    educationLevel: 'SD',
    academicYear: sdSchool.academicYear,
    semester: sdSchool.semester,
    month: 'Juli',
    week: 1,
    type: 'learning',
    title: 'Agenda privat SD',
  },
  {
    id: 'cal-smp-private',
    schoolId: 'school-smp-merauke',
    educationLevel: 'SMP',
    academicYear: sdSchool.academicYear,
    semester: sdSchool.semester,
    month: 'Juli',
    week: 1,
    type: 'learning',
    title: 'Agenda SMP tidak boleh tampil',
  },
];
const sdEvents = getCalendarEventsForSchool(mixedEvents, sdSchool);
assert.ok(sdEvents.some((event) => event.id === 'cal-sd-private'));
assert.equal(sdEvents.some((event) => event.id === 'cal-smp-private'), false);
assert.equal(sdEvents.every((event) => event.educationLevel === 'SD'), true);

const calendarHtml = buildAcademicCalendarHtml({ events: sdEvents, school: sdSchool, settings: { paperSize: 'F4' } });
assert.match(calendarHtml, /Kalender Pendidikan/);
assert.match(calendarHtml, /Minggu 1/);
assert.match(calendarHtml, /Agenda privat SD/);

const oldState = {
  appVersion: '1.5.0',
  schemaVersion: '1.5.0',
  activeSchoolId: smkSchool.id,
  school: smkSchool,
  schools: schoolSeeds,
  printSettings: { paperSize: 'Letter', orientationMode: 'auto', margin: 'normal', theme: 'classic' },
  academicCalendarEvents: [mixedEvents.find((event) => event.id === 'cal-sd-private')],
  documents: [],
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
assert.equal(migratedState.appVersion, '1.8.0');
assert.equal(migratedState.schemaVersion, '1.8.0');
assert.equal(migratedState.printSettings.paperSize, defaultPrintSettings.paperSize);
assert.ok(migratedState.academicCalendarEvents.some((event) => event.id === 'cal-sd-private'));
assert.equal(new Set(migratedState.academicCalendarEvents.map((event) => event.id)).size, migratedState.academicCalendarEvents.length);

console.log('Phase 4 tests passed.');
