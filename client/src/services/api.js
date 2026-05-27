import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dineway-auth');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.accessToken) {
          config.headers.Authorization = `Bearer ${parsed.accessToken}`;
        }
      } catch (e) {
        // Invalid token, ignore
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;

        // Update stored token
        const storedAuth = localStorage.getItem('dineway-auth');
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          parsed.accessToken = accessToken;
          localStorage.setItem('dineway-auth', JSON.stringify(parsed));
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('dineway-auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Restaurant API
export const restaurantAPI = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (slug) => api.get(`/restaurants/${slug}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
  register: (id) => api.patch(`/restaurants/${id}/register`),
  getStats: () => api.get('/restaurants/stats/count'),
};

// Reservation API
export const reservationAPI = {
  create: (data) => api.post('/reservations', data),
  getMy: (params) => api.get('/reservations/my', { params }),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`),
  getRestaurant: (restaurantId, params) =>
    api.get(`/reservations/restaurant/${restaurantId}`, { params }),
  updateStatus: (id, data) => api.patch(`/reservations/${id}/status`, data),
};

// Menu API
export const menuAPI = {
  getRestaurantMenu: (restaurantId, params) =>
    api.get(`/menu/restaurant/${restaurantId}`, { params }),
  create: (data) => api.post('/menu', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`),
};

// Review API
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getRestaurant: (restaurantId, params) =>
    api.get(`/reviews/restaurant/${restaurantId}`, { params }),
  getLatest: (limit) => api.get('/reviews/latest', { params: { limit } }),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Table API
export const tableAPI = {
  getRestaurant: (restaurantId) => api.get(`/tables/restaurant/${restaurantId}`),
  getAvailable: (params) => api.get('/tables/available', { params }),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};

export default api;