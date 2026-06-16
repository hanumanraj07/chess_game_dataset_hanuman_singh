import axios from 'axios';

const BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api/v1' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://chess-dataset.onrender.com/api/v1');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chess_auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chess_auth_token');
      localStorage.removeItem('chess_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Global GET Request Cache
const requestCache = new Map();

const originalGet = api.get;
api.get = async (url, config) => {
  const key = url + JSON.stringify(config?.params || {});
  
  if (requestCache.has(key)) {
    return Promise.resolve(requestCache.get(key));
  }
  
  const response = await originalGet.call(api, url, config);
  requestCache.set(key, response);
  return response;
};

// Clear cache on mutations to avoid stale data
const clearCache = () => requestCache.clear();

const originalPost = api.post;
api.post = async (...args) => {
  clearCache();
  return originalPost.apply(api, args);
};

const originalPut = api.put;
api.put = async (...args) => {
  clearCache();
  return originalPut.apply(api, args);
};

const originalPatch = api.patch;
api.patch = async (...args) => {
  clearCache();
  return originalPatch.apply(api, args);
};

const originalDelete = api.delete;
api.delete = async (...args) => {
  clearCache();
  return originalDelete.apply(api, args);
};

export default api;
export { BASE_URL };
