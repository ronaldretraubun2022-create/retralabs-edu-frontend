const routes = new Map();
let currentCleanup = null;

const parseLocation = () => {
  const raw = window.location.hash.replace(/^#/, '') || '/dashboard';
  const [pathname, queryString = ''] = raw.split('?');
  return {
    path: pathname.startsWith('/') ? pathname : `/${pathname}`,
    query: new URLSearchParams(queryString),
  };
};

export const router = {
  register(path, handler) {
    routes.set(path, handler);
    return this;
  },

  navigate(path) {
    window.location.hash = path;
  },

  async resolve() {
    const { path, query } = parseLocation();
    const handler = routes.get(path) || routes.get('/404');

    if (typeof currentCleanup === 'function') {
      currentCleanup();
      currentCleanup = null;
    }

    const result = await handler?.({ path, query, navigate: this.navigate.bind(this) });
    if (typeof result === 'function') currentCleanup = result;
  },

  start() {
    window.addEventListener('hashchange', () => this.resolve());
    if (!window.location.hash) window.location.hash = '/dashboard';
    this.resolve();
  },
};
