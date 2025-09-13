import axios from 'axios';

// For development
const API_BASE_URL = 'https://lead-management-1-u5b2.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API response error:', error.response?.status, error.response?.data, error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

export const leadService = {
  createLead: (leadData) => api.post('/leads', leadData),
  getLeads: (params) => api.get('/leads', { params }),
  getLead: (id) => api.get(`/leads/${id}`),
  updateLead: (id, leadData) => api.put(`/leads/${id}`, leadData),
  deleteLead: (id) => api.delete(`/leads/${id}`)
};

export default api;