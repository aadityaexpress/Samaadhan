import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const fetchDashboard = () => api.get('/dashboard');
export const fetchComplaints = (params) => api.get('/complaints', { params });
export const submitComplaint = (data) => api.post('/complaints', data);
export const updateComplaint = (id, data) => api.put(`/complaints/${id}`, data);
export const fetchCluster = (clusterId) => api.get(`/clusters/${clusterId}`);
export const fetchDepartments = () => api.get('/departments');
export const login = (credentials) => api.post('/login', credentials);
export const signup = (userData) => api.post('/users', userData);
export const fetchUsers = () => api.get('/users');
export const createUser = (userData) => api.post('/users', userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const createDepartment = (name) => api.post('/departments', { name });
export const deleteDepartment = (name) => api.delete(`/departments/${encodeURIComponent(name)}`);

export default api;
