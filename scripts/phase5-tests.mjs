import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { DEFAULT_SCHOOL_ID, schoolSeeds } from '../src/utils/education.js';
import { defaultUiPreferences, emptyState, normalizeUiPreferences } from '../src/utils/productionUi.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

assert.equal(normalizeUiPreferences({ density: 'dense', reduceMotion: 'yes', showPageContext: false }).density, defaultUiPreferences.density);
assert.equal(normalizeUiPreferences({ density: 'compact', reduceMotion: true, showPageContext: false }).reduceMotion, true);
assert.match(emptyState({ title: 'Kosong', description: 'Tidak ada data.' }), /empty-state/);

const packageJson = JSON.parse(read('package.json'));
assert.equal(packageJson.version, '1.7.0');
assert.equal(packageJson.scripts['test:phase5'], 'node scripts/phase5-tests.mjs');

const workflow = read('src/utils/workflow.js');
assert.match(workflow, /APP_VERSION = '1\.7\.0'/);
assert.match(workflow, /STORAGE_SCHEMA_VERSION = '1\.7\.0'/);

const layout = read('src/components/layout.js');
assert.match(layout, /skip-link/);
assert.match(layout, /main-content/);
assert.match(layout, /showPageContext/);

const topbar = read('src/components/topbar.js');
assert.match(topbar, /data-mobile-school-switcher/);
assert.match(topbar, /data-mobile-global-search/);
assert.match(topbar, /data-mobile-theme/);

const css = read('src/styles/app.css');
assert.match(css, /\.empty-state/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /:root\.reduce-motion/);

const teachingTools = read('src/pages/teachingTools.js');
const assessment = read('src/pages/assessment.js');
const editor = read('src/components/documentEditor.js');
const visibleUi = `${teachingTools}\n${assessment}\n${editor}`;
assert.doesNotMatch(visibleUi, /AI Assistant|AI Question|Generate dengan AI|data-ai|Draf AI|AI sedang|AI gagal|Generate Soal|Mulai Generate/);
assert.match(visibleUi, /Template Cepat/);
assert.match(visibleUi, /Template Kisi-Kisi/);
assert.match(visibleUi, /Buat Draf Template/);

const storageKey = 'retralabs-edu-state-v1';
const smkSchool = schoolSeeds.find((school) => school.id === DEFAULT_SCHOOL_ID);
const oldState = {
  appVersion: '1.6.0',
  schemaVersion: '1.6.0',
  activeSchoolId: DEFAULT_SCHOOL_ID,
  school: smkSchool,
  schools: schoolSeeds,
  printSettings: { paperSize: 'F4', orientationMode: 'auto', margin: 'normal', theme: 'newsroom', showSignature: true },
  academicCalendarEvents: [],
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
assert.equal(migratedState.appVersion, '1.7.0');
assert.equal(migratedState.schemaVersion, '1.7.0');
assert.deepEqual(migratedState.uiPreferences, defaultUiPreferences);
assert.equal(migratedState.printSettings.paperSize, 'F4');
assert.equal(migratedState.school.educationLevel, 'SMK');

store.setState({ uiPreferences: { density: 'compact', reduceMotion: true, showPageContext: false } });
const updatedState = store.getState();
assert.equal(updatedState.uiPreferences.density, 'compact');
assert.equal(updatedState.documents.length, migratedState.documents.length);

console.log('Phase 5 tests passed.');
