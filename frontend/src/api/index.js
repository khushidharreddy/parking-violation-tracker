import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Reports API
export const getReports = (params) => api.get('/reports', { params });
export const getReportById = (id) => api.get(`/reports/${id}`);
export const createReport = (data) => api.post('/reports', data);
export const updateReportStatus = (id, data) => api.put(`/reports/${id}/status`, data);
export const deleteReport = (id) => api.delete(`/reports/${id}`);

// Validation API
export const validateVehicle = (vehicleNumber) => api.post('/validate/vehicle', { vehicleNumber });
export const validateViolation = (violationCode, secondaryHint) =>
  api.post('/validate/violation', { violationCode, secondaryHint });

// Routing API
export const getRoutingMatrix = () => api.get('/routing');
export const simulateDispatch = (data) => api.post('/routing/dispatch', data);
export const getRoutingQueues = () => api.get('/routing/queue');

// Handlers API
export const getHandlers = (params) => api.get('/handlers', { params });
export const createHandler = (data) => api.post('/handlers', data);
export const updateHandler = (id, data) => api.put(`/handlers/${id}`, data);
export const getHandlerReports = (id) => api.get(`/handlers/${id}/reports`);

// Analytics API
export const getSummaryAnalytics = () => api.get('/analytics/summary');
export const getCategoryAnalytics = () => api.get('/analytics/categories');
export const getZoneAnalytics = () => api.get('/analytics/zones');
export const getDailyAnalytics = () => api.get('/analytics/daily');
export const getHandlerWorkloadAnalytics = () => api.get('/analytics/workload');

// Test Suite API
export const runTestSuite = () => api.get('/test-suite');

export default api;
