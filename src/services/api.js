import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/Auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  logout: () => API.post('/auth/logout'),
};

export const reservationsAPI = {
  // Create a reservation
  create: (bookData) => API.post('/reservations', bookData),
  // Get my reservations
  getMy: () => API.get('/reservations/my'),
  // Cancel my reservation
  cancel: (id) => API.delete(`/reservations/${id}`),
  // Get all reservations (ADMIN only)
  getAll: () => API.get('/reservations'),
};

export const loansAPI = {
  // Get my active loans
  getMy: () => API.get('/loans/my'),
  // Get all loans (ADMIN only)
  getAll: () => API.get('/loans'),
  // Create loan (ADMIN only)
  create: (loanData) => API.post('/loans', loanData),
  // Return book (ADMIN only)
  returnBook: (id) => API.put(`/loans/${id}/return`),
};

export const penaltiesAPI = {
  // Get my penalties
  getMy: () => API.get('/penalties/my'),
  // Get all penalties (ADMIN only)
  getAll: () => API.get('/penalties'),
  // Mark penalty as paid (ADMIN only)
  markPaid: (id) => API.put(`/penalties/${id}/pay`),
};

export const profileAPI = {
  // Get my profile
  getMe: () => API.get('/users/me'),
  // Update my profile
  updateMe: (userData) => API.put('/users/me', userData),
  // Change password
  changePassword: (passwordData) => API.put('/users/me/password', passwordData),
};


export const usersAPI = {
  // Get all users
  getAll: () => API.get('/users'),
  // Get user by ID
  getById: (id) => API.get(`/users/${id}`),
  // Update user
  update: (id, userData) => API.put(`/users/${id}`, userData),
  // Delete user
  delete: (id) => API.delete(`/users/${id}`),
};

export const dashboardAPI = {
  // Get dashboard data (loans, reservations, penalties, summary)
  getMy: () => API.get('/users/me/dashboard'),
};

export default API;