import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getFieldData = (params) => api.get('/field-data', { params });
export const getVegetationData = (params) => api.get('/vegetation-data', { params });
export const getPredictionHistory = (params) =>
  api.get('/prediction/history', { params });
export const getMapData = (params) =>
  api.get('/map/data', { params });
export const getVegetationStats = () => api.get('/vegetation-data/stats');
export const getVegetationByRegion = (region) => api.get(`/vegetation-data/region/${region}`);
export const getVegetationByDegradation = (level) => api.get(`/vegetation-data/degradation/${level}`);
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getDashboardCharts = () => api.get('/dashboard/charts');
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getTrees = (params) => api.get('/trees', { params });
export const getTree = (id) => api.get(`/trees/${id}`);
export const createTree = (data) => api.post('/trees', data);
export const updateTree = (id, data) => api.put(`/trees/${id}`, data);
export const deleteTree = (id) => api.delete(`/trees/${id}`);
export const exportTreesCSV = (params) => api.get('/trees/export', { params, responseType: 'blob' });
export const getTreeStats = () => api.get('/trees/stats');
export const getVegetationNDVIAnalysis = () => api.get('/vegetation-data/analysis/ndvi');
export const getVegetationSoilMoisture = () => api.get('/vegetation-data/analysis/soil-moisture');
export const getVegetationRestoration = () => api.get('/vegetation-data/analysis/restoration');
export const getBiomassSummary = () => api.get('/biomass/summary');
export const getBiomassStats = () => api.get('/biomass/stats');
export const getBiomassChart = () => api.get('/biomass/chart');
export const getBiomassHistory = () => api.get('/biomass/history');
export const getBiomassBySite = () => api.get('/biomass/by-site');
export const getBiomassByTree = (params) => api.get('/biomass/by-tree', { params });
export const calculateBiomass = (params) => api.get('/biomass/calculate', { params });
export const getCarbonStock = () => api.get('/carbon/stock');
export const getCarbonStats = () => api.get('/carbon/stats');
export const getCO2Equivalent = () => api.get('/carbon/co2');
export const getCarbonBySite = () => api.get('/carbon/by-site');
export const getCarbonByRegion = () => api.get('/carbon/by-region');
export const getCarbonChart = () => api.get('/carbon/chart');
export const calculateCarbon = (params) => api.get('/carbon/calculate', { params });
export const generateReport = (type, format) => api.get(`/reports/${type}?format=${format}`, { responseType: 'blob' });
export const getReportPreview = (type) => api.get(`/reports/${type}?format=json`);
export const getReportSummary = () => api.get('/reports/summary');
export const getPredictionHistoryReport = (params) => api.get('/reports/predictions', { params });
export const downloadGreenCampusPDF = () => api.get('/reports/generate/pdf', { responseType: 'blob' });
export const downloadGreenCampusExcel = () => api.get('/reports/generate/excel', { responseType: 'blob' });
export const authLogin = (data) => api.post('/auth/login', data);
export const authRegister = (data) => api.post('/auth/register', data);
export const authForgotPassword = (data) => api.post('/auth/forgot-password', data);
export const authResetPassword = (data) => api.post('/auth/reset-password', data);
export const authGetProfile = () => api.get('/auth/profile');
export const authUpdateProfile = (data) => api.put('/auth/profile', data);
export const authChangePassword = (data) => api.put('/auth/change-password', data);
export const getUsers = () => api.get('/auth/users');
export const updateUserRole = (id, data) => api.put(`/auth/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);

export const predictAGBFromTree = (id) =>
  api.post(`/prediction/agb/tree/${id}`);
export const predictAGB = (data) => api.post('/prediction/agb', data);
export const predictImageAGB = (formData) =>
  api.post('/prediction/image-agb', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const predictSatelliteAGB = (formData) =>
  api.post('/prediction/satellite-agb', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getImageModelInfo = () =>
  api.get('/prediction/model-info/image-agb');
export const getSatelliteModelInfo = () =>
  api.get('/prediction/model-info/satellite-agb');

export { api };
export default api;