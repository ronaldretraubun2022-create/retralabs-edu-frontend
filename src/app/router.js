const routes = new Map();
let currentCleanup = null;
let authGuard = null;
let errorHandler = null;
let started = false;
let resolveSequence = 0;

const parseLocation = () => {
  const raw = window.location.hash.replace(/^#/, '') || '/dashboard';
  const [pathname, queryString = ''] = raw.split('?');
  return {
    path: pathname.startsWith('/') ? pathname : `/${pathname}`,
    query: new URLSearchParams(queryString),
  };
};

export const router = {
  setAuthGuard(guard) {
    authGuard = guard;
    return this;
  },

  setErrorHandler(handler) {
    errorHandler = handler;
    return this;
  },

  register(path, handler) {
    routes.set(path, handler);
    return this;
  },

  navigate(path) {
    window.location.hash = path;
  },

  async resolve() {
    const sequence = ++resolveSequence;
    const { path, query } = parseLocation();
    try {
      if (authGuard) {
        const allowed = await authGuard({ path, query, navigate: this.navigate.bind(this) });
        if (sequence !== resolveSequence) return;
        if (!allowed) return;
      }
      const handler = routes.get(path) || routes.get('/404');

      if (typeof currentCleanup === 'function') {
        currentCleanup();
        currentCleanup = null;
      }

      const result = await handler?.({ path, query, navigate: this.navigate.bind(this) });
      if (sequence !== resolveSequence) {
        if (typeof result === 'function') result();
        return;
      }
      if (typeof result === 'function') currentCleanup = result;
    } catch (error) {
      if (sequence !== resolveSequence) return;
      errorHandler?.({ error, path, query, navigate: this.navigate.bind(this), retry: () => this.resolve() });
    }
  },

  start() {
    if (started) return this;
    started = true;
    window.addEventListener('hashchange', () => this.resolve());
    if (!window.location.hash) window.location.hash = '/dashboard';
    this.resolve();
    return this;
  },
};
