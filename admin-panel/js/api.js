const API_URL = 'http://localhost:3000/api';

const api = {
  token: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    let res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 && this.refreshToken) {
      const refreshed = await this.doRefresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.token}`;
        res = await fetch(`${API_URL}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
      }
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.errors?.[0]?.msg || data?.error || `Error ${res.status}`;
      throw new Error(msg);
    }
    return data;
  },

  async doRefresh() {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      this.token = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);
      return true;
    } catch {
      this.logout();
      return false;
    }
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  put(path, body) { return this.request('PUT', path, body); },
  patch(path, body) { return this.request('PATCH', path, body); },
  del(path) { return this.request('DELETE', path); },

  async login(email, password) {
    const data = await this.post('/auth/login', { email, password });
    if (data.user.role !== 'ADMIN') throw new Error('Acceso solo para administradores');
    this.token = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user = data.user;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  },

  logout() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  },

  isAuthenticated() {
    return !!this.token && !!this.user;
  },
};
