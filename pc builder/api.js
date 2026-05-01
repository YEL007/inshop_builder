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

  // ── Bootstrap: fetch catalog + pre-builts, update globals ────────────────

  async function bootstrap() {
    try {
      const [catalogRes, peripheralsRes, prebuiltsRes] = await Promise.all([
        get('/catalog'),
        get('/peripherals'),
        get('/prebuilts'),
      ]);

      // Replace catalog globals with live data
      if (catalogRes.catalog && Object.keys(catalogRes.catalog).length) {
        Object.assign(window.CATALOG, catalogRes.catalog);
      }

      // Replace peripherals
      if (peripheralsRes.peripherals && Object.keys(peripheralsRes.peripherals).length) {
        Object.assign(window.PERIPHERALS_DATA, peripheralsRes.peripherals);
      }

      // Replace pre-builts
      if (prebuiltsRes.prebuilts && prebuiltsRes.prebuilts.length) {
        window.PREBUILTS = prebuiltsRes.prebuilts;
      }

      // Rebuild ALL_PRODUCTS from fresh catalog + peripherals
      window.ALL_PRODUCTS = [
        ...Object.values(window.CATALOG).flat(),
        ...Object.values(window.PERIPHERALS_DATA).flat(),
      ];

      console.info('[PcApi] Live data loaded from Odoo.');
      window.dispatchEvent(new CustomEvent('catalog:loaded'));
    } catch (err) {
      // API unreachable — static data from data.js remains active
      console.warn('[PcApi] Could not reach backend, using static data.', err.message);
      window.dispatchEvent(new CustomEvent('catalog:loaded'));
    }

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
