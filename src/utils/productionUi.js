import { escapeHtml } from './format.js';

export const defaultUiPreferences = {
  density: 'comfortable',
  reduceMotion: false,
  showPageContext: true,
};

export const normalizeUiPreferences = (preferences = {}) => ({
  ...defaultUiPreferences,
  ...preferences,
  density: ['comfortable', 'compact'].includes(preferences.density) ? preferences.density : defaultUiPreferences.density,
  reduceMotion: preferences.reduceMotion === true,
  showPageContext: preferences.showPageContext !== false,
});

export const densityClass = (preferences = {}) =>
  normalizeUiPreferences(preferences).density === 'compact' ? 'space-y-4' : 'space-y-6';

export const emptyState = ({ icon = 'SearchX', title, description = '', action = '' }) => `
  <div class="empty-state">
    <i data-lucide="${escapeHtml(icon)}" class="mx-auto size-10 text-slate-400"></i>
    <p class="mt-3 font-black text-slate-900 dark:text-white">${escapeHtml(title)}</p>
    ${description ? `<p class="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">${escapeHtml(description)}</p>` : ''}
    ${action}
  </div>
`;
