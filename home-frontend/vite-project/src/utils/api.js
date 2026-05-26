import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds to handle extreme cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT if needed in the future
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const requestWithRetry = async (fn, retries = 5, delay = 2000, onRetry = null) => {
  try {
    return await fn();
  } catch (err) {
    if (err.response?.status >= 400 && err.response?.status < 500) {
      throw err;
    }
    const isNetworkOrServerError = !err.response || err.response.status >= 500 || err.response.status === 408;
    if (retries > 0 && isNetworkOrServerError) {
      console.log(`Connection retry triggered. Retrying in ${delay}ms... (${retries} left)`);
      if (onRetry) {
        onRetry(retries, delay);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      return requestWithRetry(fn, retries - 1, delay * 2, onRetry);
    }
    throw err;
  }
};

export default api;
