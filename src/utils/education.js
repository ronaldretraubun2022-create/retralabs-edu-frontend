export const EDUCATION_LEVELS = ['SD', 'SMP', 'SMA', 'SMK'];

export const DEFAULT_SCHOOL_ID = 'school-smk-merauke';

export const schoolSeeds = [
  {
    id: 'school-sd-merauke',
    name: 'SD Negeri 2 Merauke',
    npsn: '60100001',
    level: 'SD',
    educationLevel: 'SD',
    address: 'Merauke, Papua Selatan',
    principal: 'Yohana Wati, S.Pd.',
    principalNip: '198204112009042002',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    teacherMode: 'Guru Kelas dan Guru Mapel',
  },
  {
    id: 'school-smp-merauke',
    name: 'SMP Negeri 4 Merauke',
    npsn: '60200004',
    level: 'SMP',
    educationLevel: 'SMP',
    address: 'Merauke, Papua Selatan',
    principal: 'Agus Salim, S.Pd.',
    principalNip: '197802172006041003',
    academicYear: '2026/2027',
    semester: 'Ganjil',
  },
  {
    id: 'school-sma-merauke',
    name: 'SMA Negeri 1 Merauke',
    npsn: '60300001',
    level: 'SMA',
    educationLevel: 'SMA',
    address: 'Merauke, Papua Selatan',
    principal: 'Kristina Bela, M.Pd.',
    principalNip: '197604202005012004',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    electiveGroups: ['Sains dan Teknologi', 'Sosial Humaniora', 'Bahasa dan Budaya'],
  },
  {
    id: DEFAULT_SCHOOL_ID,
    name: 'SMK Negeri 5 Agribisnis dan Agroteknologi Merauke',
    npsn: '69999999',
    level: 'SMK',
    educationLevel: 'SMK',
    address: 'Merauke, Papua Selatan',
    principal: 'Maria Yosefa, S.Pd., M.Pd.',
    principalNip: '197905122006042001',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    expertiseField: 'Agribisnis dan Agroteknologi',
    expertiseProgram: 'Agribisnis Tanaman',
    expertiseConcentration: 'Agribisnis Tanaman Perkebunan',
    industryPartners: ['PT Perkebunan Papua Selatan', 'Balai Pelatihan Pertanian Merauke'],
    certifications: ['Sertifikasi Kompetensi Budidaya Tanaman', 'UKK Agribisnis Tanaman'],
  },
];

export const classMaster = {
  SD: ['I A', 'II A', 'III A', 'IV A', 'V A', 'VI A'],
  SMP: ['VII A', 'VIII A', 'IX A'],
  SMA: ['X A', 'XI A', 'XII A'],
  SMK: ['X ATPH 1', 'X ATPH 2', 'X TKJ 1', 'XI ATPH 1', 'XI TKJ 1', 'XII ATPH 1', 'XIII ATPH 1'],
};

export const subjectMasterByLevel = {
  SD: [
    { name: 'Pendidikan Pancasila', code: 'PP', group: 'Wajib' },
    { name: 'Bahasa Indonesia', code: 'BIND', group: 'Wajib' },
    { name: 'Matematika', code: 'MTK', group: 'Wajib' },
    { name: 'IPAS', code: 'IPAS', group: 'Wajib' },
    { name: 'Seni Budaya', code: 'SBD', group: 'Guru Mapel' },
    { name: 'PJOK', code: 'PJOK', group: 'Guru Mapel' },
    { name: 'Muatan Lokal Papua Selatan', code: 'MULOK', group: 'Muatan Lokal' },
  ],
  SMP: [
    { name: 'Bahasa Indonesia', code: 'BIND', group: 'Wajib' },
    { name: 'Matematika', code: 'MTK', group: 'Wajib' },
    { name: 'IPA', code: 'IPA', group: 'Wajib' },
    { name: 'IPS', code: 'IPS', group: 'Wajib' },
    { name: 'Informatika', code: 'INF', group: 'Wajib' },
    { name: 'Seni/Prakarya', code: 'SPK', group: 'Seni/Prakarya' },
    { name: 'Muatan Lokal Papua Selatan', code: 'MULOK', group: 'Muatan Lokal' },
  ],
  SMA: [
    { name: 'Bahasa Indonesia', code: 'BIND', group: 'Wajib' },
    { name: 'Matematika', code: 'MTK', group: 'Wajib' },
    { name: 'Bahasa Inggris', code: 'BING', group: 'Wajib' },
    { name: 'Fisika', code: 'FIS', group: 'Pilihan' },
    { name: 'Biologi', code: 'BIO', group: 'Pilihan' },
    { name: 'Ekonomi', code: 'EKO', group: 'Pilihan' },
    { name: 'Sosiologi', code: 'SOS', group: 'Pilihan' },
    { name: 'Informatika', code: 'INF', group: 'Pilihan' },
  ],
  SMK: [
    { name: 'Bahasa Indonesia', code: 'BIND', group: 'Wajib' },
    { name: 'Matematika', code: 'MTK', group: 'Wajib' },
    { name: 'Informatika', code: 'INF', group: 'Wajib' },
    { name: 'Dasar-Dasar Agribisnis Tanaman', code: 'DAT', group: 'Kejuruan' },
    { name: 'Projek IPAS', code: 'IPAS', group: 'Kejuruan' },
    { name: 'PKL', code: 'PKL', group: 'Kejuruan' },
    { name: 'Projek Kreatif dan Kewirausahaan', code: 'PKK', group: 'Kejuruan' },
    { name: 'UKK Agribisnis Tanaman', code: 'UKK', group: 'Sertifikasi' },
  ],
};

const romanOrder = ['XIII', 'XII', 'XI', 'X', 'IX', 'VIII', 'VII', 'VI', 'V', 'IV', 'III', 'II', 'I'];
const romanToNumber = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
  XIII: 13,
};

export const getClassGrade = (className = '') => {
  const normalized = String(className).trim().toUpperCase();
  const found = romanOrder.find((roman) => normalized === roman || normalized.startsWith(`${roman} `));
  return found ? romanToNumber[found] : null;
};

export const getPhaseForClass = (educationLevel, className) => {
  const grade = getClassGrade(className);
  if (!grade) return '';
  if (educationLevel === 'SD') {
    if (grade <= 2) return 'A';
    if (grade <= 4) return 'B';
    if (grade <= 6) return 'C';
  }
  if (educationLevel === 'SMP' && grade >= 7 && grade <= 9) return 'D';
  if (educationLevel === 'SMA') {
    if (grade === 10) return 'E';
    if (grade === 11 || grade === 12) return 'F';
  }
  if (educationLevel === 'SMK') {
    if (grade === 10) return 'E';
    if (grade >= 11 && grade <= 13) return 'F';
  }
  return '';
};

export const getClassesForSchool = (school = {}) => classMaster[school.educationLevel || school.level] || [];

export const getSubjectObjectsForSchool = (school = {}) => subjectMasterByLevel[school.educationLevel || school.level] || [];

export const getSubjectsForSchool = (school = {}) => getSubjectObjectsForSchool(school).map((item) => item.name);

export const getSubjectCodeForLevel = (subject, educationLevel) => {
  const subjects = subjectMasterByLevel[educationLevel] || [];
  return subjects.find((item) => item.name === subject)?.code || '';
};

export const isClassAllowed = (school = {}, className = '') => getClassesForSchool(school).includes(className);

export const validateSchoolClassPhase = ({ school, className, phase }) => {
  if (!school?.educationLevel) return 'Sekolah aktif belum valid.';
  if (!isClassAllowed(school, className)) return `Kelas ${className || '-'} tidak tersedia untuk jenjang ${school.educationLevel}.`;
  const expectedPhase = getPhaseForClass(school.educationLevel, className);
  if (!expectedPhase) return `Fase kelas ${className || '-'} tidak dikenali.`;
  if (phase && phase !== expectedPhase) return `Fase ${phase} tidak sesuai. ${school.educationLevel} ${className} harus fase ${expectedPhase}.`;
  return '';
};

export const getActiveSchool = (state = {}) => {
  const schools = Array.isArray(state.schools) && state.schools.length ? state.schools : schoolSeeds;
  return schools.find((school) => school.id === state.activeSchoolId) || state.school || schools[0];
};

export const filterDocumentsBySchool = (documents = [], schoolId = DEFAULT_SCHOOL_ID) =>
  documents.filter((document) => (document.schoolId || DEFAULT_SCHOOL_ID) === schoolId);

export const levelTemplateLabel = (school = {}) => {
  const level = school.educationLevel || school.level;
  if (level === 'SD') return 'Template SD: guru kelas, guru mapel, IPAS, dan muatan lokal.';
  if (level === 'SMP') return 'Template SMP: mapel wajib, Informatika, Seni/Prakarya, dan muatan lokal.';
  if (level === 'SMA') return 'Template SMA: mapel wajib, pilihan, dan kelompok pilihan.';
  return 'Template SMK: bidang, program, konsentrasi keahlian, PKL, sertifikasi, dan UKK.';
};

export const phase2DocumentSeeds = [
  {
    id: 'DOC-CP-SD-BIND-IA-A-01',
    code: 'CP-BIND-A-01',
    type: 'CP',
    title: 'CP Bahasa Indonesia Kelas I SD',
    subject: 'Bahasa Indonesia',
    className: 'I A',
    phase: 'A',
    schoolId: 'school-sd-merauke',
    educationLevel: 'SD',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    teacherRole: 'Guru Kelas',
    topic: 'Menyimak dan Berbicara',
    duration: '6 JP',
    elements: ['Menyimak', 'Berbicara'],
    content: 'Peserta didik mampu menyimak dan menyampaikan gagasan sederhana secara santun.',
    updatedAt: '2026-07-18T10:00:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-ACP-SD-BIND-IA-A-01',
    code: 'ACP-BIND-A-01',
    type: 'ACP',
    title: 'ACP Bahasa Indonesia Kelas I SD',
    subject: 'Bahasa Indonesia',
    className: 'I A',
    phase: 'A',
    schoolId: 'school-sd-merauke',
    educationLevel: 'SD',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    teacherRole: 'Guru Kelas',
    topic: 'Analisis CP Menyimak',
    duration: '6 JP',
    sourceIds: ['DOC-CP-SD-BIND-IA-A-01'],
    referenceIds: ['DOC-CP-SD-BIND-IA-A-01'],
    content: 'Analisis CP SD untuk keterampilan menyimak, berbicara, dan kosakata awal.',
    updatedAt: '2026-07-18T10:05:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-TP-SD-BIND-IA-A-01',
    code: 'TP-BIND-A-01',
    type: 'TP',
    title: 'Menyimak Cerita Pendek',
    subject: 'Bahasa Indonesia',
    className: 'I A',
    phase: 'A',
    schoolId: 'school-sd-merauke',
    educationLevel: 'SD',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    teacherRole: 'Guru Kelas',
    topic: 'Menyimak Cerita Pendek',
    duration: '3 JP',
    sourceIds: ['DOC-ACP-SD-BIND-IA-A-01'],
    referenceIds: ['DOC-ACP-SD-BIND-IA-A-01'],
    content: 'Peserta didik menyimak cerita pendek dan menjawab pertanyaan sederhana.',
    updatedAt: '2026-07-18T10:10:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-CP-SMP-INF-VII-D-01',
    code: 'CP-INF-D-01',
    type: 'CP',
    title: 'CP Informatika Kelas VII SMP',
    subject: 'Informatika',
    className: 'VII A',
    phase: 'D',
    schoolId: 'school-smp-merauke',
    educationLevel: 'SMP',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    topic: 'Berpikir Komputasional',
    duration: '6 JP',
    elements: ['Berpikir komputasional'],
    content: 'Peserta didik memahami dekomposisi dan pola dalam persoalan komputasional sederhana.',
    updatedAt: '2026-07-18T10:15:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-ACP-SMP-INF-VII-D-01',
    code: 'ACP-INF-D-01',
    type: 'ACP',
    title: 'ACP Informatika Kelas VII SMP',
    subject: 'Informatika',
    className: 'VII A',
    phase: 'D',
    schoolId: 'school-smp-merauke',
    educationLevel: 'SMP',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    topic: 'Analisis CP Berpikir Komputasional',
    duration: '6 JP',
    sourceIds: ['DOC-CP-SMP-INF-VII-D-01'],
    referenceIds: ['DOC-CP-SMP-INF-VII-D-01'],
    content: 'Analisis CP SMP untuk dekomposisi, pola, dan algoritma sederhana.',
    updatedAt: '2026-07-18T10:18:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-TP-SMP-INF-VII-D-01',
    code: 'TP-INF-D-01',
    type: 'TP',
    title: 'Dekomposisi Masalah SMP',
    subject: 'Informatika',
    className: 'VII A',
    phase: 'D',
    schoolId: 'school-smp-merauke',
    educationLevel: 'SMP',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    topic: 'Dekomposisi Masalah',
    duration: '3 JP',
    sourceIds: ['DOC-ACP-SMP-INF-VII-D-01'],
    referenceIds: ['DOC-ACP-SMP-INF-VII-D-01'],
    content: 'Peserta didik memecah persoalan menjadi bagian kecil yang dapat dianalisis.',
    updatedAt: '2026-07-18T10:20:00',
    status: 'review',
    progress: 80,
  },
  {
    id: 'DOC-CP-SMA-FIS-X-E-01',
    code: 'CP-FIS-E-01',
    type: 'CP',
    title: 'CP Fisika Kelas X SMA',
    subject: 'Fisika',
    className: 'X A',
    phase: 'E',
    schoolId: 'school-sma-merauke',
    educationLevel: 'SMA',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    electiveGroup: 'Sains dan Teknologi',
    topic: 'Pengukuran dan Besaran',
    duration: '6 JP',
    elements: ['Pemahaman Fisika', 'Keterampilan proses'],
    content: 'Peserta didik memahami besaran, satuan, dan pengukuran dalam eksperimen sederhana.',
    updatedAt: '2026-07-18T10:25:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-ACP-SMA-FIS-X-E-01',
    code: 'ACP-FIS-E-01',
    type: 'ACP',
    title: 'ACP Fisika Kelas X SMA',
    subject: 'Fisika',
    className: 'X A',
    phase: 'E',
    schoolId: 'school-sma-merauke',
    educationLevel: 'SMA',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    electiveGroup: 'Sains dan Teknologi',
    topic: 'Analisis CP Pengukuran',
    duration: '6 JP',
    sourceIds: ['DOC-CP-SMA-FIS-X-E-01'],
    referenceIds: ['DOC-CP-SMA-FIS-X-E-01'],
    content: 'Analisis CP SMA untuk besaran, satuan, pengukuran, dan keterampilan proses.',
    updatedAt: '2026-07-18T10:28:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-TP-SMA-FIS-X-E-01',
    code: 'TP-FIS-E-01',
    type: 'TP',
    title: 'Menggunakan Alat Ukur',
    subject: 'Fisika',
    className: 'X A',
    phase: 'E',
    schoolId: 'school-sma-merauke',
    educationLevel: 'SMA',
    academicYear: '2026/2027',
    semester: 'Ganjil',
    electiveGroup: 'Sains dan Teknologi',
    topic: 'Pengukuran',
    duration: '3 JP',
    sourceIds: ['DOC-ACP-SMA-FIS-X-E-01'],
    referenceIds: ['DOC-ACP-SMA-FIS-X-E-01'],
    content: 'Peserta didik menggunakan alat ukur dan menuliskan hasil pengukuran dengan benar.',
    updatedAt: '2026-07-18T10:30:00',
    status: 'draft',
    progress: 65,
  },
];
