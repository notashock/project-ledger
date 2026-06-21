import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let logoutHandler = null;

export const registerLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.hasOwnProperty('status') && response.data.hasOwnProperty('data')) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (logoutHandler) {
        logoutHandler();
      }
    }
    
    // Extract the message from ApiErrorResponse or generic error payload
    let errorMsg = 'An unexpected error occurred';
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (data.message) {
        errorMsg = data.message;
      } else if (data.data) {
        errorMsg = data.data;
      } else if (typeof data === 'string') {
        errorMsg = data;
      }
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    return Promise.reject(new Error(errorMsg));
  }
);

export const loginUser = (username, password) => {
  return api.post('/auth/login', { username, password }).then((res) => res.data);
};

export const registerUser = (username, password) => {
  return api.post('/auth/register', { username, password }).then((res) => res.data);
};

export const scanReceipt = (formData) => api.post('/ai/scan-debit', formData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
}).then((res) => res.data);

export const getFarmers = () => api.get('/farmers').then((res) => res.data);
export const getFarmerById = (id) => api.get(`/farmers/${id}`).then((res) => res.data);
export const getFarmerHistory = (id, query = '') => api.get(`/farmers/${id}/history`, { params: { query } }).then((res) => res.data);
export const getRecentTransactions = (limit = 10) => api.get('/transactions/recent', { params: { limit } }).then((res) => res.data);

export const createFarmer = (data) => api.post('/farmers', data).then((res) => res.data);
export const logPurchase = (data) => api.post('/transactions/purchase', data).then((res) => res.data);
export const logDebit = (data) => api.post('/transactions/debit', data).then((res) => res.data);

export const getMarketRates = () => api.get('/rates').then((res) => res.data);
export const updateMarketRates = (data) => api.post('/rates', data).then((res) => res.data);
export const getRatesHistory = () => api.get('/rates/history').then((res) => res.data);

export const getInventorySummary = () => api.get('/inventory/summary').then((res) => res.data);
export const getInventoryTrace = (cropType) => api.get(`/inventory/trace/${cropType}`).then((res) => res.data);
export const logBulkPurchase = (data) => api.post('/inventory/bulk-purchases', data).then((res) => res.data);
export const getAllGodowns = async () => {
    const response = await api.get('/inventory/godowns');
    return response.data;
};

export const getGodownDetails = async (id) => {
    const response = await api.get(`/inventory/godowns/${id}/details`);
    return response.data;
};
export const createGodown = (data) => api.post('/inventory/godowns', data).then((res) => res.data);
export const updateGodown = (id, data) => api.put(`/inventory/godowns/${id}`, data).then((res) => res.data);
export const deleteGodown = (id) => api.delete(`/inventory/godowns/${id}`).then((res) => res.data);

export const updateFarmer = (id, data) => api.put(`/farmers/${id}`, data).then((res) => res.data);
export const deleteFarmer = (id) => api.delete(`/farmers/${id}`).then((res) => res.data);

export const deletePurchase = (id) => api.delete(`/transactions/purchase/${id}`).then((res) => res.data);
export const deleteDebit = (id) => api.delete(`/transactions/debit/${id}`).then((res) => res.data);

export const updatePurchase = (id, data) => api.put(`/transactions/purchase/${id}`, data).then((res) => res.data);
export const updateDebit = (id, data) => api.put(`/transactions/debit/${id}`, data).then((res) => res.data);
export const updateBulkPurchase = (id, data) => api.put(`/inventory/bulk-purchases/${id}`, data).then((res) => res.data);

export const getUsers = () => api.get('/admin/users').then((res) => res.data);
export const createUser = (data) => api.post('/admin/users', data).then((res) => res.data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then((res) => res.data);

export default api;
