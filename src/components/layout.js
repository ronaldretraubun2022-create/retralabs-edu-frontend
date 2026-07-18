import { sidebarTemplate, bindSidebar } from './sidebar.js';
import { topbarTemplate, bindTopbar } from './topbar.js';
import { store } from '../app/store.js';
import { getActiveSchool } from '../utils/education.js';
import { escapeHtml } from '../utils/format.js';
import { backendStatusBadge } from '../utils/backendStatus.js';
import { densityClass, normalizeUiPreferences } from '../utils/productionUi.js';
import { APP_VERSION } from '../utils/workflow.js';

export const renderLayout = ({ path, title, subtitle, content }) => {
  const app = document.querySelector('#app');
  const state = store.getState();
  const activeSchool = getActiveSchool(state);
  const uiPreferences = normalizeUiPreferences(state.uiPreferences || {});
  const apiBadge = backendStatusBadge(state);
  app.innerHTML = `
    <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
    <div class="app-shell">
      ${sidebarTemplate(path)}
      <div class="min-w-0">
        ${topbarTemplate({ title, subtitle })}
        ${uiPreferences.showPageContext ? `
          <div class="border-b border-slate-200/80 bg-white/70 px-4 py-2 text-xs font-bold text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 sm:px-6 xl:px-8">
            <div class="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-1">
              <span>${escapeHtml(activeSchool.name)}</span>
              <span class="text-slate-300 dark:text-slate-700">/</span>
              <span>${escapeHtml(activeSchool.educationLevel)}</span>
              <span class="text-slate-300 dark:text-slate-700">/</span>
              <span>${escapeHtml(activeSchool.academicYear)} ${escapeHtml(activeSchool.semester)}</span>
              <span class="ml-auto flex items-center gap-2">${apiBadge}<span class="hidden text-slate-400 sm:inline">v${APP_VERSION}${state.backendVersion ? ` / API ${escapeHtml(state.backendVersion)}` : ''}</span></span>
            </div>
          </div>
        ` : ''}
        ${state.api?.lastError?.requestId ? `<div class="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 sm:px-6 xl:px-8">Request ID dukungan teknis: ${escapeHtml(state.api.lastError.requestId)}</div>` : ''}
        <main id="main-content" tabindex="-1" class="min-h-[calc(100vh-5rem)] p-4 outline-none sm:p-6 xl:p-8">
          <div class="mx-auto max-w-[1600px] animate-fade-in ${densityClass(uiPreferences)}">${content}</div>
        </main>
      </div>
    </div>
  `;

  bindSidebar();
  bindTopbar();
  window.dispatchEvent(new CustomEvent('retralabs:icons'));
};
