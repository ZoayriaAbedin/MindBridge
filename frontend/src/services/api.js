import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Doctors API
export const doctorsAPI = {
  search: (params) => api.get('/doctors/search', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getRecommended: () => api.get('/doctors/recommended/for-me'),
  getPending: () => api.get('/doctors/pending/approvals'),
  approve: (id) => api.post(`/doctors/${id}/approve`),
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id, data) => api.post(`/appointments/${id}/cancel`, data),
};

// Prescriptions API
export const prescriptionsAPI = {
  getAll: (params) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  create: (data) => api.post('/prescriptions', data),
  update: (id, data) => api.put(`/prescriptions/${id}`, data),
};

// Medical History API
export const medicalHistoryAPI = {
  getByPatient: (patientId) => api.get(`/medical-history/patient/${patientId}`),
  add: (patientId, data) => api.post(`/medical-history/patient/${patientId}`, data),
  update: (id, data) => api.put(`/medical-history/${id}`, data),
  delete: (id) => api.delete(`/medical-history/${id}`),
};

// Support Groups API
export const supportGroupsAPI = {
  getAll: (params) => api.get('/support-groups', { params }),
  getById: (id) => api.get(`/support-groups/${id}`),
  getMyGroups: () => api.get('/support-groups/my/groups'),
  create: (data) => api.post('/support-groups', data),
  update: (id, data) => api.put(`/support-groups/${id}`, data),
  join: (id) => api.post(`/support-groups/${id}/join`),
  leave: (id) => api.post(`/support-groups/${id}/leave`),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  uploadProfilePicture: (formData) => api.post('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
  activate: (id) => api.post(`/users/${id}/activate`),
};

export default api;
