// PC Builder — Odoo API client
// Fetches live data from the backend and populates the same globals
// that the static data.js defines, so the rest of the app is unchanged.
// Falls back to static data if the API is unreachable.

(function () {
  const BASE = '/api/pc';

  // ── Low-level helpers ────────────────────────────────────────────────────

  async function get(path) {
    const res = await fetch(BASE + path, { credentials: 'include' });
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    return res.json();
  }

  async function post(path, body) {
    const res = await fetch(BASE + path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
    return res.json();
  }

  // ── Public API surface (used by pages) ───────────────────────────────────

  window.PcApi = {

    // Auth
    async login(email, password) {
      return post('/auth/login', { login: email, password });
    },

    async register(name, email, password) {
      return post('/auth/register', { name, email, password });
    },

    async logout() {
      return post('/auth/logout', {});
    },

    async me() {
      return get('/auth/me');
    },

    async updateProfile(data) {
      return post('/auth/update', { data });
    },

    // Products
    async getProducts(category) {
      const path = category ? `/products/${category}` : '/products';
      return get(path);
    },

    async getProduct(odooId) {
      return get(`/product/${odooId}`);
    },

    // Cart
    async getCart() {
      return get('/cart');
    },

    async cartAdd(productOdooId, qty = 1) {
      return post('/cart/add', { product_id: productOdooId, qty });
    },

    async cartRemove(productOdooId) {
      return post('/cart/remove', { product_id: productOdooId });
    },

    async cartSync(items) {
      // items array of { product_id, qty }
      return post('/cart/sync', { items });
    },

    // Orders
    async confirmOrder(shipping) {
      return post('/order/confirm', { shipping });
    },

    async getOrders() {
      return get('/orders');
    },
  };

  // ── Bootstrap: fetch catalog + pre-builts from Odoo, populate globals ──────

  async function bootstrap() {
    let catalogOk = false;

    try {
      const [catalogRes, peripheralsRes, prebuiltsRes] = await Promise.all([
        get('/catalog'),
        get('/peripherals'),
        get('/prebuilts'),
      ]);

      if (catalogRes.catalog) {
        Object.assign(window.CATALOG, catalogRes.catalog);
      }

      if (peripheralsRes.peripherals) {
        Object.assign(window.PERIPHERALS_DATA, peripheralsRes.peripherals);
      }

      if (Array.isArray(prebuiltsRes.prebuilts)) {
        window.PREBUILTS = prebuiltsRes.prebuilts;
      }

      window.ALL_PRODUCTS = [
        ...Object.values(window.CATALOG).flat(),
        ...Object.values(window.PERIPHERALS_DATA).flat(),
      ];

      catalogOk = true;
      console.info('[PcApi] Live data loaded from Odoo.');
    } catch (err) {
      console.error('[PcApi] Backend unreachable — catalog empty.', err.message);
    }

    window.dispatchEvent(new CustomEvent('catalog:loaded', { detail: { ok: catalogOk } }));

    // Check existing session
    try {
      const session = await window.PcApi.me();
      if (session.authenticated) {
        window.dispatchEvent(new CustomEvent('pc:session', { detail: session }));
      }
    } catch (_) {
      // No active session — fine
    }
  }

  // Run after data.js has executed (scripts are sequential)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
