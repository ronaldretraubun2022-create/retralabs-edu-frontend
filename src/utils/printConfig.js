export const paperConfigs = {
  A4: {
    id: 'A4',
    label: 'A4',
    widthMm: 210,
    heightMm: 297,
  },
  F4: {
    id: 'F4',
    label: 'F4 / Folio',
    widthMm: 215,
    heightMm: 330,
  },
};

export const themeConfigs = {
  newsroom: {
    id: 'newsroom',
    label: 'Newsroom Formal',
    fontFamily: 'Arial, Helvetica, sans-serif',
    accent: '#7f1d1d',
    border: '#222222',
  },
  classic: {
    id: 'classic',
    label: 'Klasik Sekolah',
    fontFamily: '"Times New Roman", Times, serif',
    accent: '#111827',
    border: '#333333',
  },
};

export const defaultPrintSettings = {
  paperSize: 'F4',
  orientationMode: 'auto',
  theme: 'newsroom',
  margin: 'normal',
  showSignature: true,
};

export const marginConfigs = {
  normal: { top: 18, right: 16, bottom: 18, left: 16 },
  compact: { top: 12, right: 12, bottom: 12, left: 12 },
  wide: { top: 24, right: 22, bottom: 24, left: 22 },
};

const denseTypes = new Set(['ATP', 'PROTA', 'PROSEM', 'KKTP', 'ASESMEN']);

export const normalizePrintSettings = (settings = {}) => ({
  ...defaultPrintSettings,
  ...settings,
  paperSize: paperConfigs[settings.paperSize] ? settings.paperSize : defaultPrintSettings.paperSize,
  theme: themeConfigs[settings.theme] ? settings.theme : defaultPrintSettings.theme,
  margin: marginConfigs[settings.margin] ? settings.margin : defaultPrintSettings.margin,
  orientationMode: ['auto', 'portrait', 'landscape'].includes(settings.orientationMode) ? settings.orientationMode : defaultPrintSettings.orientationMode,
  showSignature: settings.showSignature !== false,
});

export const shouldUseLandscape = (document = {}) => {
  const rowCount = Math.max(
    Array.isArray(document.units) ? document.units.length : 0,
    Array.isArray(document.schedules) ? document.schedules.length : 0,
    Array.isArray(document.sourceIds) ? document.sourceIds.length : 0,
  );
  return denseTypes.has(document.type) || rowCount >= 6;
};

export const getPrintPageConfig = (document = {}, settings = {}) => {
  const normalized = normalizePrintSettings(settings);
  const orientation = normalized.orientationMode === 'auto'
    ? (shouldUseLandscape(document) ? 'landscape' : 'portrait')
    : normalized.orientationMode;
  return {
    settings: normalized,
    paper: paperConfigs[normalized.paperSize],
    theme: themeConfigs[normalized.theme],
    margin: marginConfigs[normalized.margin],
    orientation,
  };
};

export const educationPrintLabels = {
  SD: {
    teacherLabel: 'Guru Kelas / Guru Mapel',
    specialtyTitle: 'Informasi SD',
    specialtyFields: ['teacherRole'],
  },
  SMP: {
    teacherLabel: 'Guru Mata Pelajaran',
    specialtyTitle: 'Informasi SMP',
    specialtyFields: [],
  },
  SMA: {
    teacherLabel: 'Guru Mata Pelajaran',
    specialtyTitle: 'Informasi SMA',
    specialtyFields: ['electiveGroup'],
  },
  SMK: {
    teacherLabel: 'Guru Produktif / Mapel',
    specialtyTitle: 'Informasi Kejuruan',
    specialtyFields: ['expertiseField', 'expertiseProgram', 'expertiseConcentration', 'industryPartner', 'certification'],
  },
};
