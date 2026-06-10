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

export default api;
export { BASE_URL };
