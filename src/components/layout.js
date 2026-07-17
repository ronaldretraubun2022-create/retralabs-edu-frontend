import { sidebarTemplate, bindSidebar } from './sidebar.js';
import { topbarTemplate, bindTopbar } from './topbar.js';

export const renderLayout = ({ path, title, subtitle, content }) => {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="app-shell">
      ${sidebarTemplate(path)}
      <div class="min-w-0">
        ${topbarTemplate({ title, subtitle })}
        <main class="min-h-[calc(100vh-5rem)] p-4 sm:p-6 xl:p-8">
          <div class="mx-auto max-w-[1600px] animate-fade-in">${content}</div>
        </main>
      </div>
    </div>
  `;

  bindSidebar();
  bindTopbar();
  window.dispatchEvent(new CustomEvent('retralabs:icons'));
};
