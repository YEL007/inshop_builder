// PC Builder — Django API client
// Fetches live data from the backend and populates the same globals
// that the static data.js defines, so the rest of the app is unchanged.
// Falls back to static data if the API is unreachable.

(function () {
  const BASE = '/api/pc';

  // ── Token helpers ────────────────────────────────────────────────────────
  // The backend issues a random Bearer token on login that is stored here.
  // It is completely independent from the Django admin session cookie, so the
  // backend admin is never disconnected when a customer logs in.

  function getToken() { return localStorage.getItem('inshop_token') || ''; }
  function saveToken(t) { if (t) localStorage.setItem('inshop_token', t); }
  function clearToken() { localStorage.removeItem('inshop_token'); }

  function authHeaders() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  // ── Low-level helpers ────────────────────────────────────────────────────

  async function get(path) {
    const res = await fetch(BASE + path, {
      credentials: 'include',
      headers: { ...authHeaders() },
    });
    if (!res.ok) {
      let msg = `GET ${path} → ${res.status}`;
      try {
        const d = await res.json();
        if (d && d.error) msg = d.error;
      } catch (err) {}
      throw new Error(msg);
    }
    return res.json();
  }

  async function post(path, body) {
    const res = await fetch(BASE + path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let msg = `POST ${path} → ${res.status}`;
      try {
        const d = await res.json();
        if (d && d.error) msg = d.error;
      } catch (err) {}
      throw new Error(msg);
    }
    return res.json();
  }

  // ── Public API surface (used by pages) ───────────────────────────────────

  window.PcApi = {

    // Auth
    async login(email, password) {
      const res = await post('/auth/login', { login: email, password });
      if (res.token) saveToken(res.token);
      return res;
    },

    async register(name, email, password, phone, address) {
      return post('/auth/register', { name, email, password, phone: phone || '', address: address || '' });
    },

    async resetPasswordRequest(email) {
      return post('/auth/reset-password-request', { email });
    },

    async resetPasswordConfirm(email, code, password) {
      return post('/auth/reset-password-confirm', { email, code, password });
    },

    async logout() {
      const res = await post('/auth/logout', {}).catch(() => ({}));
      clearToken();
      return res;
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

    async getDashboard() {
      return get('/dashboard');
    },

    async advanceDelivery(orderId) {
      return post(`/order/${orderId}/delivery/next`, {});
    },

    // Admin
    async adminOrders() {
      return get('/admin/orders');
    },

    async adminDashboard() {
      return get('/admin/dashboard');
    },

    async adminAdvanceDelivery(orderId) {
      return post(`/admin/order/${orderId}/delivery/next`, {});
    },

    async getRelated(productId) {
      return get(`/product/${productId}/related`);
    },
    async getConfig() {
      return get('/config');
    },
    async getCategories() {
      return get('/categories');
    },
    async submitContact(data) {
      // data: { name, email, subject, message }
      return post('/contact/submit', data);
    },
    async submitReview(data) {
      // data: { product_id, rating, comment }
      return post('/review', data);
    },
  };

  // ── Bootstrap: fetch catalog + pre-builts from Django, populate globals ──────

  async function bootstrap() {
    let catalogOk = false;

    try {
      const [catalogRes, peripheralsRes, prebuiltsRes, onlyOnePcsRes, onlyOneCatalogRes, laptopsRes, configRes, categoriesRes] = await Promise.all([
        get('/catalog'),
        get('/peripherals'),
        get('/prebuilts'),
        get('/onlyonepcs'),
        get('/onlyone_catalog'),
        get('/laptops'),
        get('/config'),
        get('/categories'),
      ]);

      if (catalogRes.catalog) {
        Object.assign(window.CATALOG, catalogRes.catalog);
      }

      if (onlyOneCatalogRes.catalog) {
        window.ONLYONE_CATALOG = onlyOneCatalogRes.catalog;
      } else {
        window.ONLYONE_CATALOG = {};
      }

      if (peripheralsRes.peripherals) {
        Object.assign(window.PERIPHERALS_DATA, peripheralsRes.peripherals);
      }

      if (Array.isArray(prebuiltsRes.prebuilts)) {
        window.PREBUILTS = prebuiltsRes.prebuilts;
      }

      if (Array.isArray(onlyOnePcsRes.onlyonepcs)) {
        window.ONLYONEPCS = onlyOnePcsRes.onlyonepcs;
      }

      if (Array.isArray(laptopsRes.laptops)) {
        window.LAPTOPS = laptopsRes.laptops;
      }

      window.ALL_PRODUCTS = [
        ...Object.values(window.CATALOG).flat(),
        ...Object.values(window.ONLYONE_CATALOG || {}).flat(),
        ...Object.values(window.PERIPHERALS_DATA).flat(),
        ...window.LAPTOPS,
      ];

      if (configRes) {
        window.SITE_CONFIG = configRes;
      }

      if (categoriesRes && categoriesRes.categories) {
        window.PC_CATEGORIES_DATA = categoriesRes.categories;
      }

      try { 
        localStorage.setItem('inshop_products_cache', JSON.stringify(window.ALL_PRODUCTS));
        localStorage.setItem('inshop_catalog_cache', JSON.stringify(window.CATALOG));
        localStorage.setItem('inshop_prebuilts_cache', JSON.stringify(window.PREBUILTS));
        localStorage.setItem('inshop_onlyonepcs_cache', JSON.stringify(window.ONLYONEPCS));
        localStorage.setItem('inshop_laptops_cache', JSON.stringify(window.LAPTOPS));
        localStorage.setItem('inshop_peripherals_cache', JSON.stringify(window.PERIPHERALS_DATA));
        localStorage.setItem('inshop_categories_cache', JSON.stringify(window.PC_CATEGORIES_DATA));
        localStorage.setItem('inshop_onlyone_catalog_cache', JSON.stringify(window.ONLYONE_CATALOG));
      } catch(_) {}
      catalogOk = true;
      console.info('[PcApi] Live data loaded from Django.');
    } catch (err) {
      console.error('[PcApi] Catalog bootstrap failed:', err);
    }

    window.dispatchEvent(new CustomEvent('catalog:loaded', { detail: { ok: catalogOk } }));

    // Check existing session
    try {
      const session = await window.PcApi.me();
      if (session.authenticated) {
        window.dispatchEvent(new CustomEvent('pc:session', { detail: session }));
      }
    } catch (_) {}

    return catalogOk;
  }

  // Restore cached products for offline favorites display
  try {
    const _c = JSON.parse(localStorage.getItem('inshop_products_cache') || 'null');
    if (Array.isArray(_c) && _c.length > 0) window.ALL_PRODUCTS = _c;

    const _cat = JSON.parse(localStorage.getItem('inshop_catalog_cache') || 'null');
    if (_cat) Object.assign(window.CATALOG, _cat);

    const _pre = JSON.parse(localStorage.getItem('inshop_prebuilts_cache') || 'null');
    if (Array.isArray(_pre)) window.PREBUILTS = _pre;

    const _oop = JSON.parse(localStorage.getItem('inshop_onlyonepcs_cache') || 'null');
    if (Array.isArray(_oop)) window.ONLYONEPCS = _oop;

    const _lap = JSON.parse(localStorage.getItem('inshop_laptops_cache') || 'null');
    if (Array.isArray(_lap)) window.LAPTOPS = _lap;

    const _peri = JSON.parse(localStorage.getItem('inshop_peripherals_cache') || 'null');
    if (_peri) Object.assign(window.PERIPHERALS_DATA, _peri);

    const _cats = JSON.parse(localStorage.getItem('inshop_categories_cache') || 'null');
    if (Array.isArray(_cats)) window.PC_CATEGORIES_DATA = _cats;

    const _oocat = JSON.parse(localStorage.getItem('inshop_onlyone_catalog_cache') || 'null');
    if (_oocat) window.ONLYONE_CATALOG = _oocat;
  } catch(_) {}

  // Run after data.js has executed (scripts are sequential)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
