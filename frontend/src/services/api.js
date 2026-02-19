import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
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

// Helper function to get current user ID from localStorage
const getCurrentUserId = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user).userId;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  }
  return null;
};

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  logout: () => API.post('/auth/logout'),
};

export const booksAPI = {
  // Get all books with pagination
  getAll: (page = 0, size = 10, sortBy = 'title') => 
    API.get('/books', { params: { page, size, sortBy } }),
  // Get book by ID
  getById: (id) => API.get(`/books/${id}`),
  // Search books
  search: (keyword, page = 0, size = 10) => 
    API.get('/books/search', { params: { keyword, page, size } }),
  // Get available books
  getAvailable: () => API.get('/books/available'),
  // Get all genres
  getGenres: () => API.get('/books/genres'),
  // Create book (ADMIN only)
  create: (bookData) => API.post('/books', bookData),
  // Update book (ADMIN only)
  update: (id, bookData) => API.put(`/books/${id}`, bookData),
  // Delete book (ADMIN only)
  delete: (id) => API.delete(`/books/${id}`),
};

export const loansAPI = {
  // Get my loans (all loans for current user - both active and returned)
  getMy: () => {
    const userId = getCurrentUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return API.get(`/loans/user/${userId}`);
  },
  // Get my active loans only
  getMyActive: () => {
    const userId = getCurrentUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return API.get(`/loans/user/${userId}/active`);
  },
  // Get loan by ID
  getById: (id) => API.get(`/loans/${id}`),
  // Get all loans (ADMIN only)
  getAll: () => API.get('/loans'),
  // Get overdue loans (ADMIN only)
  getOverdue: () => API.get('/loans/overdue'),
  // Borrow a book
  borrow: (loanData) => API.post('/loans/borrow', loanData),
  // Return a book (ADMIN only)
  returnBook: (id) => API.put(`/loans/${id}/return`),
};

export const penaltiesAPI = {
  // Get my penalties
  getMy: () => {
    const userId = getCurrentUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return API.get(`/penalties/user/${userId}`);
  },
  // Get my unpaid penalties
  getMyUnpaid: () => {
    const userId = getCurrentUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return API.get(`/penalties/user/${userId}/unpaid`);
  },
  // Get total unpaid penalties amount
  getMyTotalUnpaid: () => {
    const userId = getCurrentUserId();
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return API.get(`/penalties/user/${userId}/total`);
  },
  // Get penalty by ID
  getById: (id) => API.get(`/penalties/${id}`),
  // Get all penalties (ADMIN only)
  getAll: () => API.get('/penalties'),
  // Waive a penalty (ADMIN only)
  waive: (id) => API.put(`/penalties/${id}/waive`),
};

export const reservationsAPI = {
  // NOTE: ReservationController not yet implemented in backend
  // Placeholder for future implementation
  // create: (bookData) => API.post('/reservations', bookData),
  // getMy: () => API.get('/reservations/my'),
  // cancel: (id) => API.delete(`/reservations/${id}`),
  // getAll: () => API.get('/reservations'),
};

export const usersAPI = {
  // Get all users (ADMIN only)
  getAll: () => API.get('/users'),
  // Get user by ID (ADMIN only)
  getById: (id) => API.get(`/users/${id}`),
  // Get user by email (ADMIN only)
  getByEmail: (email) => API.get(`/users/email/${email}`),
  // Get all patrons (ADMIN only)
  getPatrons: () => API.get('/users/patrons'),
  // Suspend user (ADMIN only)
  suspend: (id) => API.put(`/users/${id}/suspend`),
  // Activate user (ADMIN only)
  activate: (id) => API.put(`/users/${id}/activate`),
  // Delete user (ADMIN only)
  delete: (id) => API.delete(`/users/${id}`),
};

export const dashboardAPI = {
  // Get dashboard data by making individual API calls
  getMy: async () => {
    try {
      const [loansResponse, penaltiesResponse] = await Promise.all([
        loansAPI.getMy(),
        penaltiesAPI.getMy(),
      ]);
      
      return {
        data: {
          activeLoans: loansResponse.data,
          penalties: penaltiesResponse.data,
        }
      };
    } catch (error) {
      return Promise.reject(error);
    }
  },
};

export default API;