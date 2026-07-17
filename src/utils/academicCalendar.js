export const calendarEventTypes = {
  learning: { label: 'Pembelajaran', className: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' },
  assessment: { label: 'Asesmen', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  holiday: { label: 'Libur', className: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  project: { label: 'Projek', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  industry: { label: 'Dunia Kerja', className: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' },
};

export const defaultCalendarEvents = [
  { id: 'cal-sd-ganjil-01', educationLevel: 'SD', semester: 'Ganjil', month: 'Juli', week: 2, type: 'learning', title: 'Awal pembelajaran fase A-C' },
  { id: 'cal-sd-ganjil-02', educationLevel: 'SD', semester: 'Ganjil', month: 'September', week: 3, type: 'assessment', title: 'Asesmen formatif tematik' },
  { id: 'cal-smp-ganjil-01', educationLevel: 'SMP', semester: 'Ganjil', month: 'Juli', week: 2, type: 'learning', title: 'Awal pembelajaran fase D' },
  { id: 'cal-smp-ganjil-02', educationLevel: 'SMP', semester: 'Ganjil', month: 'Oktober', week: 1, type: 'project', title: 'Projek kolaboratif lintas mapel' },
  { id: 'cal-sma-ganjil-01', educationLevel: 'SMA', semester: 'Ganjil', month: 'Juli', week: 2, type: 'learning', title: 'Awal pembelajaran fase E-F' },
  { id: 'cal-sma-ganjil-02', educationLevel: 'SMA', semester: 'Ganjil', month: 'November', week: 2, type: 'assessment', title: 'Asesmen sumatif mapel pilihan' },
  { id: 'cal-smk-ganjil-01', educationLevel: 'SMK', semester: 'Ganjil', month: 'Juli', week: 2, type: 'learning', title: 'Awal pembelajaran kejuruan' },
  { id: 'cal-smk-ganjil-02', educationLevel: 'SMK', semester: 'Ganjil', month: 'Agustus', week: 4, type: 'industry', title: 'Sinkronisasi mitra dunia kerja' },
  { id: 'cal-smk-ganjil-03', educationLevel: 'SMK', semester: 'Ganjil', month: 'November', week: 3, type: 'assessment', title: 'Pra-UKK dan sertifikasi internal' },
];

export const calendarMonths = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];

export const normalizeCalendarEvents = (events = []) => {
  const map = new Map(defaultCalendarEvents.map((event) => [event.id, event]));
  events.filter((event) => event?.id).forEach((event) => map.set(event.id, { ...map.get(event.id), ...event }));
  return [...map.values()];
};

export const getCalendarEventsForSchool = (events = [], school = {}) =>
  normalizeCalendarEvents(events)
    .filter((event) => {
      const matchesLevel = event.educationLevel === (school.educationLevel || school.level);
      const matchesSchool = !event.schoolId || event.schoolId === school.id;
      const matchesYear = !event.academicYear || event.academicYear === school.academicYear;
      return matchesLevel && matchesSchool && matchesYear && event.semester === school.semester;
    })
    .sort((left, right) => calendarMonths.indexOf(left.month) - calendarMonths.indexOf(right.month) || left.week - right.week);
