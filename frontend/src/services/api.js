import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const getCleanBaseURL = (url) => {
  if (!url) return '/api/v1';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.endsWith('/api/v1')) {
    if (cleaned.endsWith('/api')) {
      cleaned = `${cleaned}/v1`;
    } else {
      cleaned = `${cleaned}/api/v1`;
    }
  }
  return cleaned;
};

const api = axios.create({
  baseURL: getCleanBaseURL(rawBaseURL),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('az_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('az_token');
    }
    return Promise.reject(error);
  }
);

export default api;
