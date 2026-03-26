import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
};

// Sales API
export const salesApi = {
  record: (data) => api.post('/sales', data),
  getAll: (params) => api.get('/sales', { params }),
  getByDateRange: (startDate, endDate) => api.get(`/sales/${startDate}/${endDate}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getDailySales: (days) => api.get('/dashboard/daily-sales', { params: { days } }),
  getMonthlyProfit: () => api.get('/dashboard/monthly-profit'),
};

// Reports API
export const reportsApi = {
  getDailySalesReport: (date) => api.get('/reports/daily-sales', { params: { date } }),
  getMonthlySalesReport: (month) => api.get('/reports/monthly-sales', { params: { month } }),
  getProfitReport: () => api.get('/reports/profit'),
  getStockReport: () => api.get('/reports/stock'),
  getProductPerformance: () => api.get('/reports/product-performance'),
};

export default api;
