import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message || 'Request failed';
    // eslint-disable-next-line no-console
    console.error('[api]', msg);
    return Promise.reject(err);
  }
);

/* Feedback */
export const listFeedback = (params) => api.get('/feedback', { params }).then(r => r.data);
export const createFeedback = (body) => api.post('/feedback', body).then(r => r.data);
export const deleteFeedback = (id) => api.delete(`/feedback/${id}`).then(r => r.data);
export const importCSV = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/feedback/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

/* AI */
export const analyzeFeedback = (body) => api.post('/ai/analyze', body).then(r => r.data);
export const clusterFeedback = (body) => api.post('/ai/cluster', body).then(r => r.data);
export const listIssues = () => api.get('/ai/issues').then(r => r.data);
export const updateIssue = (id, body) => api.patch(`/ai/issues/${id}`, body).then(r => r.data);

/* Analytics */
export const getOverview = (params) => api.get('/analytics/overview', { params }).then(r => r.data);
export const getTrends = (params) => api.get('/analytics/trends', { params }).then(r => r.data);
export const getTopComplaints = (params) => api.get('/analytics/top-complaints', { params }).then(r => r.data);
export const getSentimentByCategory = (params) => api.get('/analytics/sentiment-by-category', { params }).then(r => r.data);

export default api;

/* Feedback: fetch a specific set of ids (used by Issue detail) */
export const listFeedbackByIds = (ids) =>
  api.get('/feedback', { params: { ids: ids.join(','), limit: 200 } }).then(r => r.data);

/* AI: bulk update issue statuses */
export const bulkUpdateIssueStatus = (ids, status) =>
  api.post('/ai/issues/bulk-status', { ids, status }).then(r => r.data);

/* Reports */
export const createReport = (body) => api.post('/reports', body).then(r => r.data);
export const listReports = () => api.get('/reports').then(r => r.data);
export const getReport = (id) => api.get(`/reports/${id}`).then(r => r.data);
export const deleteReport = (id) => api.delete(`/reports/${id}`).then(r => r.data);
