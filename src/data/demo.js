export const schoolProfile = {
  name: 'SMK Negeri 5 Agribisnis dan Agroteknologi Merauke',
  npsn: '69999999',
  level: 'SMK',
  address: 'Merauke, Papua Selatan',
  principal: 'Maria Yosefa, S.Pd., M.Pd.',
  principalNip: '197905122006042001',
  academicYear: '2026/2027',
  semester: 'Ganjil',
};

export const currentUser = {
  name: 'Ronald Retraubun',
  email: 'ronald@retralabs.id',
  role: 'Administrator',
  initials: 'RR',
};

export const curriculumFlow = [
  { code: 'CP', label: 'Capaian Pembelajaran', icon: 'Target', count: 18, status: 'Aktif' },
  { code: 'ACP', label: 'Analisis Capaian Pembelajaran', icon: 'ScanSearch', count: 12, status: 'Aktif' },
  { code: 'TP', label: 'Tujuan Pembelajaran', icon: 'Milestone', count: 48, status: 'Aktif' },
  { code: 'ATP', label: 'Alur Tujuan Pembelajaran', icon: 'Waypoints', count: 14, status: 'Aktif' },
  { code: 'PROTA', label: 'Program Tahunan', icon: 'CalendarRange', count: 8, status: 'Aktif' },
  { code: 'PROSEM', label: 'Program Semester', icon: 'CalendarDays', count: 10, status: 'Aktif' },
  { code: 'RPP', label: 'Rencana Pelaksanaan Pembelajaran', icon: 'NotebookPen', count: 22, status: 'Aktif' },
  { code: 'MODUL', label: 'Modul Ajar', icon: 'BookOpenCheck', count: 16, status: 'Aktif' },
  { code: 'KKTP', label: 'Kriteria Ketercapaian Tujuan Pembelajaran', icon: 'Gauge', count: 9, status: 'Aktif' },
];

export const documents = [
  {
    id: 'DOC-001',
    type: 'RPP',
    title: 'RPP Dasar Pertanian — Pertemuan 1',
    subject: 'Dasar-Dasar Agribisnis Tanaman',
    className: 'X ATPH 1',
    phase: 'E',
    updatedAt: '2026-07-18T08:40:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-002',
    type: 'ATP',
    title: 'ATP Informatika Fase E',
    subject: 'Informatika',
    className: 'X TKJ 1',
    phase: 'E',
    updatedAt: '2026-07-17T18:20:00',
    status: 'review',
    progress: 86,
  },
  {
    id: 'DOC-003',
    type: 'PROTA',
    title: 'PROTA Matematika Kelas X',
    subject: 'Matematika',
    className: 'X Umum',
    phase: 'E',
    updatedAt: '2026-07-16T13:30:00',
    status: 'draft',
    progress: 62,
  },
  {
    id: 'DOC-004',
    type: 'MODUL',
    title: 'Modul Ajar Ekosistem Papua Selatan',
    subject: 'IPAS',
    className: 'X ATPH 2',
    phase: 'E',
    updatedAt: '2026-07-15T09:10:00',
    status: 'approved',
    progress: 100,
  },
  {
    id: 'DOC-005',
    type: 'KKTP',
    title: 'KKTP Bahasa Indonesia Semester Ganjil',
    subject: 'Bahasa Indonesia',
    className: 'X Semua Kelas',
    phase: 'E',
    updatedAt: '2026-07-14T15:45:00',
    status: 'revision',
    progress: 74,
  },
  {
    id: 'DOC-006',
    type: 'PROSEM',
    title: 'PROSEM Sejarah Indonesia',
    subject: 'Sejarah',
    className: 'XI ATPH 1',
    phase: 'F',
    updatedAt: '2026-07-13T11:00:00',
    status: 'approved',
    progress: 100,
  },
];

export const activities = [
  { icon: 'FileCheck2', title: 'RPP disetujui kepala sekolah', detail: 'RPP Dasar Pertanian — Pertemuan 1', time: '10 menit lalu', tone: 'success' },
  { icon: 'Sparkles', title: 'AI menghasilkan ATP baru', detail: 'ATP Informatika Fase E', time: '1 jam lalu', tone: 'info' },
  { icon: 'MessageSquareText', title: 'Dokumen perlu revisi', detail: 'KKTP Bahasa Indonesia Semester Ganjil', time: '3 jam lalu', tone: 'warning' },
  { icon: 'CloudUpload', title: 'Sinkronisasi selesai', detail: '12 dokumen tersimpan di cloud', time: 'Kemarin', tone: 'info' },
];

export const schedule = [
  { time: '07.30', end: '09.00', subject: 'Dasar-Dasar Agribisnis', className: 'X ATPH 1', room: 'Lab Pertanian' },
  { time: '09.15', end: '10.45', subject: 'Informatika', className: 'X TKJ 1', room: 'Lab Komputer' },
  { time: '11.00', end: '12.30', subject: 'Projek IPAS', className: 'X ATPH 2', room: 'Ruang 04' },
];

export const subjects = [
  'Bahasa Indonesia',
  'Matematika',
  'Informatika',
  'Dasar-Dasar Agribisnis Tanaman',
  'Projek IPAS',
  'Sejarah',
  'Pendidikan Pancasila',
  'Bahasa Inggris',
];

export const classes = ['X ATPH 1', 'X ATPH 2', 'X TKJ 1', 'XI ATPH 1', 'XI TKJ 1', 'XII ATPH 1'];

export const questionBank = [
  { id: 1, type: 'Pilihan Ganda', subject: 'Informatika', topic: 'Berpikir Komputasional', difficulty: 'Sedang', questions: 25 },
  { id: 2, type: 'Uraian', subject: 'Bahasa Indonesia', topic: 'Teks Laporan Hasil Observasi', difficulty: 'Sedang', questions: 10 },
  { id: 3, type: 'Pilihan Ganda', subject: 'Matematika', topic: 'Eksponen dan Logaritma', difficulty: 'Sulit', questions: 30 },
  { id: 4, type: 'Praktik', subject: 'Dasar-Dasar Agribisnis Tanaman', topic: 'Persiapan Lahan', difficulty: 'Sedang', questions: 8 },
];
