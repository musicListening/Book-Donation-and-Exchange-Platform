// src/services/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api');

function authHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('ss_current_user');
  localStorage.removeItem('userRole');
}

async function checkResponse(response) {
  if (response.status === 401) {
    clearAuth();
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = '/login?redirect=' + returnUrl;
    throw new Error('Session expired');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || body.message || `HTTP ${response.status}`);
  }
  return response.json();
}

// ===== USER API =====
export const userAPI = {
  getById: async (id) => {
    console.log('📡 GET /users');
    const users = await fetch(`${API_BASE}/users`, { headers: authHeaders() }).then(checkResponse);
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },
  getAll: async () => {
    console.log('📡 GET /users');
    const response = await fetch(`${API_BASE}/users`, { headers: authHeaders() });
    return checkResponse(response);
  },
};

// ===== ADMIN DASHBOARD API =====
export const adminAPI = {
  getDashboard: async () => {
    console.log('📡 GET /admin/dashboard');
    const response = await fetch(`${API_BASE}/admin/dashboard`, { headers: authHeaders() });
    return checkResponse(response);
  },
  getReport: async (type, startDate, endDate) => {
    const params = new URLSearchParams({ type, startDate, endDate });
    console.log(`📡 GET /admin/report?${params}`);
    const response = await fetch(`${API_BASE}/admin/report?${params}`, {
      headers: authHeaders({ 'Cache-Control': 'no-cache' }),
    });
    return checkResponse(response);
  },
};

// ===== AUTH API =====
export const authAPI = {
  logout: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// ===== TASK API (Staff Dashboard) =====
export const taskAPI = {
    // GET all tasks
    getAll: async () => {
        console.log('📡 GET /tasks');
        const response = await fetch(`${API_BASE}/tasks`, { headers: authHeaders() });
        return checkResponse(response);
    },

    // CREATE a task
    create: async (data) => {
        console.log('📡 POST /tasks', data);
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },

    update: async (id, data) => {
        console.log(`📡 PUT /tasks/${id}`, data);
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },

    delete: async (id) => {
        console.log(`📡 DELETE /tasks/${id}`);
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        return checkResponse(response);
    },

    updateStatus: async (id, status) => {
        console.log(`📡 PUT /tasks/${id}/status`, { status });
        const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ status }),
        });
        return checkResponse(response);
    },
};

// ===== SYSTEM CONFIG API =====
export const systemConfigAPI = {
  getAll: async () => {
    console.log('📡 GET /admin/config');
    const response = await fetch(`${API_BASE}/admin/config`, { headers: authHeaders() });
    return checkResponse(response);
  },
  update: async (config) => {
    console.log('📡 PUT /admin/config', config);
    const response = await fetch(`${API_BASE}/admin/config`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(config),
    });
    return checkResponse(response);
  },
};

// ===== COLLECTION API (Bundle Management) =====
export const collectionAPI = {
    getAll: async () => {
        console.log('📡 GET /collections');
        const response = await fetch(`${API_BASE}/collections`);
        return checkResponse(response);
    },

    create: async (data) => {
        console.log('📡 POST /collections', data);
        const response = await fetch(`${API_BASE}/collections`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },

    update: async (id, data) => {
        console.log(`📡 PUT /collections/${id}`, data);
        const response = await fetch(`${API_BASE}/collections/${id}`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },

    delete: async (id) => {
        console.log(`📡 DELETE /collections/${id}`);
        const response = await fetch(`${API_BASE}/collections/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        return checkResponse(response);
    },
};

// src/services/api.js - Add these methods

// ===== BOOK API (Inventory Management) =====
export const bookAPI = {
    getAll: async () => {
        console.log('📡 GET /books');
        const response = await fetch(`${API_BASE}/books`);
        return checkResponse(response);
    },

    create: async (data) => {
        console.log('📡 POST /books', data);
        const response = await fetch(`${API_BASE}/books`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },

    update: async (id, data) => {
        console.log(`📡 PUT /books/${id}`, data);
        const response = await fetch(`${API_BASE}/books/${id}`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },

    delete: async (id) => {
        console.log(`📡 DELETE /books/${id}`);
        const response = await fetch(`${API_BASE}/books/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        return checkResponse(response);
    },
};
// src/services/api.js - Add these methods

// ===== SHIPMENT API (Order Fulfillment) =====
export const shipmentAPI = {
    getAll: async (status) => {
        console.log('📡 GET /shipments' + (status && status !== 'All' ? `?status=${status}` : ''));
        const response = await fetch(`${API_BASE}/shipments${status && status !== 'All' ? `?status=${status}` : ''}`, { headers: authHeaders() });
        return checkResponse(response);
    },

    create: async (data) => {
        console.log('📡 POST /shipments', data);
        const response = await fetch(`${API_BASE}/shipments`, {
            method: 'POST',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },

    update: async (id, data) => {
        console.log(`📡 PUT /shipments/${id}`, data);
        const response = await fetch(`${API_BASE}/shipments/${id}`, {
            method: 'PUT',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },

    delete: async (id) => {
        console.log(`📡 DELETE /shipments/${id}`);
        const response = await fetch(`${API_BASE}/shipments/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        return checkResponse(response);
    },
};

// ===== COMMUNITY API =====
const communityRequest = async (path, options = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/community${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (response.status === 204) return null;
    return checkResponse(response);
};

export const communityAPI = {
    getEvents: () => communityRequest('/events'),
    createEvent: (data) => communityRequest('/events', { method: 'POST', body: JSON.stringify(data) }),
    updateEvent: (id, data) => communityRequest(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEvent: (id) => communityRequest(`/events/${id}`, { method: 'DELETE' }),
    participateInEvent: (id) => communityRequest(`/events/${id}/participate`, { method: 'POST' }),
    getMessages: () => communityRequest('/messages'),
    sendMessage: (content) => communityRequest('/messages', { method: 'POST', body: JSON.stringify({ content }) }),
    deleteMessage: (id) => communityRequest(`/messages/${id}`, { method: 'DELETE' }),
    updateMessage: (id, content) => communityRequest(`/messages/${id}`, { method: 'PUT', body: JSON.stringify({ content }) }),
    getStats: () => communityRequest('/stats'),
};

// ===== DONATION API =====
export const donationAPI = {
    getAll: async () => {
        const response = await fetch(`${API_BASE}/donations`);
        return checkResponse(response);
    },
    verify: async (donationId, data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/donations/${donationId}/verify`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data),
        });
        return checkResponse(response);
    },
    reject: async (donationId, notes) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/donations/${donationId}/reject`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ notes }),
        });
        return checkResponse(response);
    },
    assignMysteryBox: async (donationId, staffId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/donations/${donationId}/mystery-box`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ staffId }),
        });
        return checkResponse(response);
    },
};

// ===== MYSTERY BOX API =====
export const mysteryBoxAPI = {
    getByUser: async (userId) => {
        const response = await fetch(`${API_BASE}/mystery-boxes/user/${userId}`);
        return checkResponse(response);
    },
    claim: async (boxId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/mystery-boxes/${boxId}/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
        });
        return checkResponse(response);
    },
};