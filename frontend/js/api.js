// MathsProf API Client
const API = {
  baseUrl: window.location.origin,

  getToken() {
    return localStorage.getItem('math_prof_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('math_prof_token', token);
    } else {
      localStorage.removeItem('math_prof_token');
    }
  },

  getUser() {
    const userStr = localStorage.getItem('math_prof_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('math_prof_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('math_prof_user');
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  normalizeEndpoint(endpoint) {
    if (!endpoint.startsWith('/api')) {
      return `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }
    return endpoint;
  },

  async request(endpoint, options = {}) {
    const normEndpoint = this.normalizeEndpoint(endpoint);
    const url = `${this.baseUrl}${normEndpoint}`;
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        if (!normEndpoint.includes('/api/auth/login')) {
          this.setToken(null);
          this.setUser(null);
          window.location.hash = '#login';
          if (window.Toast) Toast.error('Session expirée. Veuillez vous reconnecter.');
        }
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMsg = 'Une erreur est survenue';
        if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (data.detail && typeof data.detail.message === 'string') {
          errorMsg = data.detail.message;
        } else if (Array.isArray(data.detail)) {
          errorMsg = data.detail.map(d => d.msg).join(', ');
        }
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${normEndpoint}:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

window.API = API;
window.api = API;

