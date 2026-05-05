import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
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

export const requestWithRetry = async (fn, retries = 2) => {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && (!err.response || err.response.status >= 500)) {
      console.log(`Retrying request... (${retries} left)`);
      return requestWithRetry(fn, retries - 1);
    }
    throw err;
  }
};

export default api;
