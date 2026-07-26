// src/services/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '/api' : 'https://book-donation-and-exchange-platform.onrender.com/api');

// ===== USER API =====
export const userAPI = {
  getById: async (id) => {
    console.log('📡 GET /users');
    const users = await fetch(`${API_BASE}/users`).then(r => r.json());
    const user = users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },
  getAll: async () => {
    console.log('📡 GET /users');
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

// ===== ADMIN DASHBOARD API =====
export const adminAPI = {
  getDashboard: async () => {
    console.log('📡 GET /admin/dashboard');
    const response = await fetch(`${API_BASE}/admin/dashboard`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  getReport: async (type, startDate, endDate) => {
    const params = new URLSearchParams({ type, startDate, endDate });
    console.log(`📡 GET /admin/report?${params}`);
    const response = await fetch(`${API_BASE}/admin/report?${params}`, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

// ===== TASK API (Staff Dashboard) =====
export const taskAPI = {
    // GET all tasks
    getAll: async () => {
        console.log('📡 GET /tasks');
        const response = await fetch(`${API_BASE}/tasks`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    // CREATE a task
    create: async (data) => {
        console.log('📡 POST /tasks', data);
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    // UPDATE a task
    update: async (id, data) => {
        console.log(`📡 PUT /tasks/${id}`, data);
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    // DELETE a task
    delete: async (id) => {
        console.log(`📡 DELETE /tasks/${id}`);
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    // UPDATE status only
    updateStatus: async (id, status) => {
        console.log(`📡 PUT /tasks/${id}/status`, { status });
        const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },
};

// ===== SYSTEM CONFIG API =====
export const systemConfigAPI = {
  getAll: async () => {
    console.log('📡 GET /admin/config');
    const response = await fetch(`${API_BASE}/admin/config`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
  update: async (config) => {
    console.log('📡 PUT /admin/config', config);
    const response = await fetch(`${API_BASE}/admin/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

// ===== COLLECTION API (Bundle Management) =====
export const collectionAPI = {
    getAll: async () => {
        console.log('📡 GET /collections');
        const response = await fetch(`${API_BASE}/collections`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    create: async (data) => {
        console.log('📡 POST /collections', data);
        const response = await fetch(`${API_BASE}/collections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    update: async (id, data) => {
        console.log(`📡 PUT /collections/${id}`, data);
        const response = await fetch(`${API_BASE}/collections/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    delete: async (id) => {
        console.log(`📡 DELETE /collections/${id}`);
        const response = await fetch(`${API_BASE}/collections/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },
};

// src/services/api.js - Add these methods

// ===== BOOK API (Inventory Management) =====
export const bookAPI = {
    getAll: async () => {
        console.log('📡 GET /books');
        const response = await fetch(`${API_BASE}/books`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    create: async (data) => {
        console.log('📡 POST /books', data);
        const response = await fetch(`${API_BASE}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    update: async (id, data) => {
        console.log(`📡 PUT /books/${id}`, data);
        const response = await fetch(`${API_BASE}/books/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    delete: async (id) => {
        console.log(`📡 DELETE /books/${id}`);
        const response = await fetch(`${API_BASE}/books/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },
};
// src/services/api.js - Add these methods

// ===== SHIPMENT API (Order Fulfillment) =====
export const shipmentAPI = {
    getAll: async (status) => {
        console.log('📡 GET /shipments' + (status && status !== 'All' ? `?status=${status}` : ''));
        const response = await fetch(`${API_BASE}/shipments${status && status !== 'All' ? `?status=${status}` : ''}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    create: async (data) => {
        console.log('📡 POST /shipments', data);
        const response = await fetch(`${API_BASE}/shipments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    update: async (id, data) => {
        console.log(`📡 PUT /shipments/${id}`, data);
        const response = await fetch(`${API_BASE}/shipments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
    },

    delete: async (id) => {
        console.log(`📡 DELETE /shipments/${id}`);
        const response = await fetch(`${API_BASE}/shipments/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        return response.json();
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

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    },
};

// ===== MYSTERY BOX API =====
export const mysteryBoxAPI = {
    getByUser: async (userId) => {
        const response = await fetch(`${API_BASE}/mystery-boxes/user/${userId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    },
};