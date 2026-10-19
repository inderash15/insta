import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const backendOrigin = rawApiUrl ? rawApiUrl.replace(/\/api\/?$/, '') : '';
const baseURL = rawApiUrl ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${backendOrigin}/api`) : '/api';

export const getBackendOrigin = () => backendOrigin;

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (!backendOrigin) return url;
  return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Recursively prefix /uploads/ in response data when cross-origin backend is used
const prefixUploads = (data) => {
  if (!backendOrigin || !data) return data;
  if (typeof data === 'string') {
    if (data.startsWith('/uploads/')) {
      return `${backendOrigin}${data}`;
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(prefixUploads);
  }
  if (typeof data === 'object') {
    const updated = {};
    for (const [k, v] of Object.entries(data)) {
      updated[k] = prefixUploads(v);
    }
    return updated;
  }
  return data;
};

// Response interceptor for unified error messages and media resolution
api.interceptors.response.use(
  (response) => {
    if (backendOrigin && response.data) {
      response.data = prefixUploads(response.data);
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
