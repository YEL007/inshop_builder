const API_BASE = '/api/pc';

window.API = {
    token: localStorage.getItem('admin_token'),
    rate: 614,

    async init() {
        try {
            const r = await fetch('https://open.er-api.com/v6/latest/USD').then(res => res.json());
            if (r.rates?.XOF) {
                this.rate = r.rates.XOF;
            }
        } catch(e) { console.error("Failed to fetch rate", e); }
    },

    async fetch(url, options = {}) {
        if (!this.rate_initialized) {
            await this.init();
            this.rate_initialized = true;
        }
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
        const resp = await fetch(`${API_BASE}${url}`, { ...options, headers });
        if (resp.status === 401 || resp.status === 403) {
            localStorage.removeItem('admin_token');
            this.token = null;
            window.location.reload();
        }
        return resp;
    },

    async login(username, password) {
        const resp = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: username, password }),
        });
        const data = await resp.json();
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('admin_token', this.token);
            // Verify staff status
            if (!data.is_staff) {
                this.token = null;
                localStorage.removeItem('admin_token');
                return false;
            }
            return true;
        }
        return false;
    },

    async logout() {
        localStorage.removeItem('admin_token');
        this.token = null;
        window.location.reload();
    },

    async dashboard() {
        const resp = await this.fetch('/admin/dashboard');
        return await resp.json();
    },

    _endpoint(model) {
        const map = {
            orders: 'orders_crud', contacts: 'messages', onlyone: 'onlyonepcs',
            // Virtual sub-types — all backed by the products endpoint
            components: 'products', laptops: 'products', peripherals: 'products',
        };
        return map[model] || model;
    },

    _typeParam(model) {
        const map = { components: 'component', laptops: 'laptop', peripherals: 'peripheral' };
        return map[model] || null;
    },

    async list(model) {
        if (model === 'groups') return [];
        const typeParam = this._typeParam(model);
        const url = typeParam
            ? `/admin/${this._endpoint(model)}/?category_type=${typeParam}`
            : `/admin/${this._endpoint(model)}/`;
        const resp = await this.fetch(url);
        const data = await resp.json();
        const results = data.results || data;
        if (Array.isArray(results)) {
            results.forEach(item => {
                if (item.price) item.price = Math.round(item.price * this.rate);
            });
        }
        return results;
    },

    async get(model, id) {
        if (model === 'groups') return {};
        const resp = await this.fetch(`/admin/${this._endpoint(model)}/${id}/`);
        const data = await resp.json();
        if (data && data.price) data.price = Math.round(data.price * this.rate);
        return data;
    },

    async save(model, id, data) {
        if (model === 'groups') return {};
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/admin/${this._endpoint(model)}/${id}/` : `/admin/${this._endpoint(model)}/`;
        const body = { ...data };
        if (body.price) body.price = parseFloat(body.price) / this.rate;
        const resp = await this.fetch(url, { method, body: JSON.stringify(body) });
        const resData = await resp.json();
        if (resData && resData.price) resData.price = Math.round(resData.price * this.rate);
        return resData;
    },

    async delete(model, id) {
        if (model === 'groups') return false;
        const resp = await this.fetch(`/admin/${this._endpoint(model)}/${id}/`, { method: 'DELETE' });
        return resp.ok;
    },

    async deleteExtraImage(model, imageId) {
        const map = {
            components: 'product-images', laptops: 'product-images', peripherals: 'product-images',
            prebuilts: 'prebuilt-images', onlyone: 'onlyone-images',
        };
        const endpoint = map[model];
        if (!endpoint) return false;
        const resp = await this.fetch(`/admin/${endpoint}/${imageId}/`, { method: 'DELETE' });
        return resp.ok;
    },

    // For saving with optional file upload (products use this)
    async saveForm(model, id, data, imageFile, extraImages = []) {
        if (model === 'groups') return {};
        const endpoint = id
            ? `/admin/${this._endpoint(model)}/${id}/`
            : `/admin/${this._endpoint(model)}/`;
        const method = id ? 'PATCH' : 'POST';

        // Fields that are file/nested — never send as raw strings/objects
        const FILE_FIELDS = ['image', 'extra_images'];

        if (imageFile || (extraImages && extraImages.length > 0)) {
            const fd = new FormData();
            for (const [k, v] of Object.entries(data)) {
                if (FILE_FIELDS.includes(k)) continue; // handled separately below
                if (v !== null && v !== undefined && !Array.isArray(v)) {
                    let finalVal = v;
                    if (k === 'price') finalVal = parseFloat(v) / this.rate;
                    fd.append(k, typeof finalVal === 'boolean' ? String(finalVal) : finalVal);
                }
            }
            if (imageFile) fd.append('image', imageFile);
            extraImages.forEach(file => fd.append('extra_images', file));
            const headers = {};
            if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
            const resp = await fetch(`${API_BASE}${endpoint}`, { method, headers, body: fd });
            if (resp.status === 401 || resp.status === 403) {
                localStorage.removeItem('admin_token');
                this.token = null;
                window.location.reload();
            }
            const resData = await resp.json();
            if (resData && resData.price) resData.price = Math.round(resData.price * this.rate);
            return resData;
        }

        // JSON path: strip file/nested fields — Django can't accept URL strings for ImageField
        const jsonData = Object.fromEntries(
            Object.entries(data).filter(([k]) => !FILE_FIELDS.includes(k) && !Array.isArray(data[k]))
        );
        if (jsonData.price) jsonData.price = parseFloat(jsonData.price) / this.rate;
        const resp = await this.fetch(endpoint, { method, body: JSON.stringify(jsonData) });
        const resData = await resp.json();
        if (resData && resData.price) resData.price = Math.round(resData.price * this.rate);
        return resData;
    },
    async advanceDelivery(id) {
        const resp = await this.fetch(`/admin/order/${id}/delivery/next`, { method: 'POST' });
        return resp.ok;
    },
};
