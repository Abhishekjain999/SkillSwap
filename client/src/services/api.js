import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillswap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on auth failure if not in public route
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        // Option to logout or refresh
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  demoLogin: (username) => api.post('/auth/demo-login', { username }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
};

// Users & Discovery Endpoints
export const usersAPI = {
  discover: (params) => api.get('/users/discover', { params }),
  getProfile: (identifier) => api.get(`/users/${identifier}`),
  globalSearch: (q) => api.get('/users/search/global', { params: { q } }),
  reportUser: (data) => api.post('/users/report', data),
};

// Matching Engine Endpoints
export const matchAPI = {
  getRecommended: () => api.get('/matches'),
  getWithUser: (targetUserId) => api.get(`/matches/${targetUserId}`),
};

// Exchange Requests Endpoints
export const exchangeAPI = {
  create: (data) => api.post('/exchanges', data),
  getMyExchanges: (params) => api.get('/exchanges', { params }),
  updateStatus: (id, status, note) => api.put(`/exchanges/${id}/status`, { status, note }),
  counterOffer: (id, data) => api.post(`/exchanges/${id}/counter`, data),
};

// Learning Contracts Endpoints
export const contractAPI = {
  getMyContracts: () => api.get('/contracts'),
  getById: (id) => api.get(`/contracts/${id}`),
  toggleGoal: (contractId, goalId) => api.put(`/contracts/${contractId}/goals/${goalId}`),
};

// Sessions Endpoints
export const sessionAPI = {
  create: (data) => api.post('/sessions', data),
  getMySessions: (params) => api.get('/sessions', { params }),
  getByIdentifier: (identifier) => api.get(`/sessions/${identifier}`),
  startSession: (id) => api.put(`/sessions/${id}/start`),
  completeSession: (id, data) => api.post(`/sessions/${id}/complete`, data),
  saveNotes: (id, notes) => api.put(`/sessions/${id}/notes`, { notes }),
  saveCode: (id, codeData) => api.put(`/sessions/${id}/code`, codeData),
  uploadFile: (id, formData) => api.post(`/sessions/${id}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Notifications Endpoints
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Skills Endpoints
export const skillAPI = {
  getAll: (params) => api.get('/skills', { params }),
  create: (data) => api.post('/skills', data),
};

// Admin Endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}`, data),
};

// Docker Code Execution Engine Endpoints
export const codeAPI = {
  execute: (data) => api.post('/code/execute', data),
  getLanguages: () => api.get('/code/languages'),
};
