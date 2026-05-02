import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthAttempt =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/signup');

    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Server timeout. Try again.';
    } else if (!error.response) {
      error.userMessage = 'Cannot reach server. Check API URL.';
    }

    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;