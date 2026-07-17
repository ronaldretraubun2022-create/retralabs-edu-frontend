import { downloadFile, escapeHtml, slugify } from './format.js';
import { buildDocumentFilename, buildDocumentHtml } from './documentTemplates.js';
import { calendarEventTypes, calendarMonths } from './academicCalendar.js';
import { getPrintPageConfig } from './printConfig.js';
import { getDocumentCode } from './workflow.js';

const openPrintWindow = (html) => {
  const popup = window.open('', '_blank', 'width=1100,height=800');
  if (!popup) {
    throw new Error('Popup print diblokir browser.');
  }
  popup.opener = null;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.addEventListener('load', () => {
    popup.print();
  });
};

export const exportDocumentAsWord = ({ document, school, settings }) => {
  const html = buildDocumentHtml({ document, school, settings, mode: 'word' });
  downloadFile(buildDocumentFilename(document, 'doc'), html, 'application/msword;charset=utf-8');
};

export const printDocument = ({ document, school, settings }) => {
  const html = buildDocumentHtml({ document, school, settings, mode: 'print' });
  openPrintWindow(html);
};

export const buildDocumentListHtml = ({ documents = [], school = {}, settings = {} }) => {
  const page = getPrintPageConfig({ type: 'PROSEM', units: documents }, settings);
  const paperWidth = page.orientation === 'landscape' ? page.paper.heightMm : page.paper.widthMm;
  const paperHeight = page.orientation === 'landscape' ? page.paper.widthMm : page.paper.heightMm;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daftar Dokumen ${escapeHtml(school.name || '')}</title>
  <style>
    @page { size: ${paperWidth}mm ${paperHeight}mm; margin: ${page.margin.top}mm ${page.margin.right}mm ${page.margin.bottom}mm ${page.margin.left}mm; }
    body { font-family: ${page.theme.fontFamily}; color: #111827; font-size: 10.5pt; }
    h1 { margin: 0 0 6px; font-size: 16pt; }
    p { margin: 0 0 14px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #6b7280; padding: 6px; vertical-align: top; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  <h1>Daftar Dokumen Perangkat Ajar</h1>
  <p>${escapeHtml(school.name || '')} - ${escapeHtml(school.educationLevel || '')}</p>
  <table>
    <thead>
      <tr><th>No</th><th>Kode</th><th>Jenis</th><th>Judul</th><th>Mapel</th><th>Kelas</th><th>Status</th></tr>
    </thead>
    <tbody>
      ${documents.map((document, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(getDocumentCode(document))}</td>
          <td>${escapeHtml(document.type || '')}</td>
          <td>${escapeHtml(document.title || '')}</td>
          <td>${escapeHtml(document.subject || '')}</td>
          <td>${escapeHtml(document.className || '')}</td>
          <td>${escapeHtml(document.status || '')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;
};

export const printDocumentList = ({ documents, school, settings }) => {
  openPrintWindow(buildDocumentListHtml({ documents, school, settings }));
};

export const exportDocumentJson = (document) => {
  downloadFile(`${slugify(document.title || getDocumentCode(document))}.json`, JSON.stringify(document, null, 2), 'application/json;charset=utf-8');
};

export const buildAcademicCalendarHtml = ({ events = [], school = {}, settings = {} }) => {
  const page = getPrintPageConfig({ type: 'PROSEM', schedules: events }, settings);
  const paperWidth = page.orientation === 'landscape' ? page.paper.heightMm : page.paper.widthMm;
  const paperHeight = page.orientation === 'landscape' ? page.paper.widthMm : page.paper.heightMm;
  const eventsByMonth = new Map(calendarMonths.map((month) => [month, []]));
  events.forEach((event) => {
    if (!eventsByMonth.has(event.month)) eventsByMonth.set(event.month, []);
    eventsByMonth.get(event.month).push(event);
  });

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kalender Pendidikan ${escapeHtml(school.name || '')}</title>
  <style>
    @page { size: ${paperWidth}mm ${paperHeight}mm; margin: ${page.margin.top}mm ${page.margin.right}mm ${page.margin.bottom}mm ${page.margin.left}mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111827; font-family: ${page.theme.fontFamily}; font-size: 10pt; line-height: 1.35; }
    h1 { margin: 0; font-size: 16pt; text-transform: uppercase; }
    .meta { margin: 4px 0 14px; color: #475569; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #6b7280; padding: 6px; vertical-align: top; }
    th { background: #f1f5f9; }
    .month { width: 90px; font-weight: 700; color: ${page.theme.accent}; }
    .event { margin-bottom: 5px; }
    .type { font-weight: 700; }
  </style>
</head>
<body>
  <h1>Kalender Pendidikan</h1>
  <p class="meta">${escapeHtml(school.name || '')} - ${escapeHtml(school.educationLevel || school.level || '')} - ${escapeHtml(school.academicYear || '')} - ${escapeHtml(school.semester || '')}</p>
  <table>
    <thead><tr><th>Bulan</th><th>Minggu 1</th><th>Minggu 2</th><th>Minggu 3</th><th>Minggu 4</th></tr></thead>
    <tbody>
      ${calendarMonths.map((month) => {
        const monthEvents = eventsByMonth.get(month) || [];
        return `<tr>
          <td class="month">${escapeHtml(month)}</td>
          ${[1, 2, 3, 4].map((week) => {
            const weekEvents = monthEvents.filter((event) => Number(event.week) === week);
            return `<td>${weekEvents.map((event) => {
              const type = calendarEventTypes[event.type]?.label || event.type || 'Agenda';
              return `<div class="event"><span class="type">${escapeHtml(type)}:</span> ${escapeHtml(event.title || '')}</div>`;
            }).join('') || '-'}</td>`;
          }).join('')}
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</body>
</html>`;
};

export const printAcademicCalendar = ({ events, school, settings }) => {
  openPrintWindow(buildAcademicCalendarHtml({ events, school, settings }));
};
