import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.hasOwnProperty('status') && response.data.hasOwnProperty('data')) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.data && error.response.data.hasOwnProperty('data')) {
      error.response.data = error.response.data.data;
    }
    return Promise.reject(error);
  }
);

export const getFarmers = () => api.get('/farmers').then((res) => res.data);
export const getFarmerById = (id) => api.get(`/farmers/${id}`).then((res) => res.data);
export const getFarmerHistory = (id, query = '') => api.get(`/farmers/${id}/history`, { params: { query } }).then((res) => res.data);

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

export default api;
