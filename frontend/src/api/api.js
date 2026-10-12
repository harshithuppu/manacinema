import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // optionally handle session expiry
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: (refreshToken) => api.post('/auth/refresh', null, { params: { refreshToken } }),
};

// ── Movies (Public) ───────────────────────────────────────────────────────────
export const movieAPI = {
  getAll:       (page = 0, size = 20) => api.get('/movies', { params: { page, size } }),
  getById:      (id) => api.get(`/movies/${id}`),
  getNowShowing:(page = 0, size = 20, language = null) =>
    api.get('/movies/now-showing', { params: { page, size, ...(language ? { language } : {}) } }),
  getComingSoon:(page = 0, size = 20, language = null) =>
    api.get('/movies/coming-soon', { params: { page, size, ...(language ? { language } : {}) } }),
  search:       (params) => api.get('/movies/search', { params }),
  getGenres:    () => api.get('/movies/genres'),
  getLanguages: () => api.get('/movies/languages'),

  // Admin CRUD
  create: (movieData) => api.post('/movies', movieData),
  update: (id, movieData) => api.put(`/movies/${id}`, movieData),
  updateStatus: (id, status) => api.patch(`/movies/admin/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/movies/${id}`),

  // TMDB Proxy (key stays server-side)
  tmdbPublicNowPlaying: (language = null, page = 1) =>
    api.get('/movies/public/tmdb/now-playing', { params: { page, ...(language ? { language } : {}) } }),
  tmdbPublicSearch: (query, page = 1) =>
    api.get('/movies/public/tmdb/search', { params: { query, page } }),
  tmdbSearch:      (query, page = 1) => api.get('/movies/admin/tmdb/search', { params: { query, page } }),
  tmdbNowPlaying:  (language = null, page = 1) =>
    api.get('/movies/admin/tmdb/now-playing', { params: { page, ...(language ? { language } : {}) } }),
  tmdbGetDetails:  (tmdbId) => api.get(`/movies/admin/tmdb/${tmdbId}`),
  tmdbImport:      (importData) => api.post('/movies/admin/tmdb/import', importData),
};

// ── Theaters ──────────────────────────────────────────────────────────────────
export const theaterAPI = {
  getPublic:    (params) => api.get('/theaters/public', { params }),
  getById:      (id) => api.get(`/theaters/public/${id}`),
  getCities:    () => api.get('/theaters/public/cities'),
  getMyTheaters:(page = 0, size = 10) => api.get('/theaters/manage/my-theaters', { params: { page, size } }),
  create:       (theaterData) => api.post('/theaters/manage', theaterData),
  update:       (id, theaterData) => api.put(`/theaters/manage/${id}`, theaterData),
  delete:       (id) => api.delete(`/theaters/manage/${id}`),
  addScreen:    (theaterId, screenData) => api.post(`/theaters/manage/${theaterId}/screens`, screenData),
  getScreens:   (theaterId) => api.get(`/theaters/public/${theaterId}/screens`),
  updateStatus: (id, status) => api.put(`/theaters/admin/${id}/status`, null, { params: { status } }),
};

// ── Shows ─────────────────────────────────────────────────────────────────────
export const showAPI = {
  getById:           (id) => api.get(`/shows/public/${id}`),
  getByMovie:        (movieId) => api.get(`/shows/public/movie/${movieId}`),
  getByMovieCityDate:(movieId, city, date) =>
    api.get(`/shows/public/movie/${movieId}/search`, { params: { city, date } }),
  getByTheater:      (theaterId) => api.get(`/shows/public/theater/${theaterId}`),
  getSeats:          (showId) => api.get(`/shows/public/${showId}/seats`),
  create:            (showData) => api.post('/shows/manage', showData),
  update:            (id, showData) => api.put(`/shows/manage/${id}`, showData),
  cancel:            (id) => api.delete(`/shows/manage/${id}`),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingAPI = {
  create:       (bookingData) => api.post('/bookings', bookingData),
  getMyBookings:(page = 0, size = 10) => api.get('/bookings/my-bookings', { params: { page, size } }),
  getById:      (id) => api.get(`/bookings/${id}`),
  getByNumber:  (number) => api.get(`/bookings/number/${number}`),
  cancel:       (id) => api.post(`/bookings/${id}/cancel`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboardStats:  () => api.get('/admin/dashboard'),
  getUsers:           (page = 0, size = 10) => api.get('/admin/users', { params: { page, size } }),
  toggleUserStatus:   (id) => api.put(`/admin/users/${id}/toggle-status`),
  getPendingTheaters: (page = 0, size = 10) => api.get('/admin/theaters/pending', { params: { page, size } }),
  approveTheater:     (id) => api.put(`/admin/theaters/${id}/approve`),
  rejectTheater:      (id) => api.put(`/admin/theaters/${id}/reject`),
  getBookings:        (page = 0, size = 10) => api.get('/admin/bookings', { params: { page, size } }),
};

export default api;
