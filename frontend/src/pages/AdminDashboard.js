import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, movieAPI } from '../api/api';
import PosterUrlField from '../components/PosterUrlField';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('MOVIES'); // MOVIES, THEATERS, USERS, BOOKINGS
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalTheaters: 0,
    totalBookings: 0,
    pendingTheaters: 0,
  });

  const [movies, setMovies] = useState([]);
  const [pendingTheaters, setPendingTheaters] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Movie modal
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    language: 'English',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt',
    durationMinutes: 150,
    rating: 8.5,
    certification: 'UA',
    status: 'NOW_SHOWING',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
    trailerUrl: 'https://www.youtube.com',
  });

  // Edit Movie modal
  const [editMovie, setEditMovie] = useState(null);
  const [editMovieForm, setEditMovieForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const openEditMovie = (movie) => {
    setEditMovie(movie);
    setEditMovieForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      language: movie.language || 'Telugu',
      director: movie.director || '',
      cast: movie.cast || '',
      durationMinutes: movie.durationMinutes || 120,
      rating: movie.rating || 8.0,
      certification: movie.certification || 'UA',
      status: movie.status || 'NOW_SHOWING',
      posterUrl: movie.posterUrl || '',
      trailerUrl: movie.trailerUrl || '',
    });
  };

  const handleSaveEditMovie = async (e) => {
    e.preventDefault();
    if (!editMovieForm.title?.trim() || !editMovieForm.posterUrl?.trim()) {
      alert('Movie Title and Poster URL are required.');
      return;
    }
    setSavingEdit(true);
    try {
      await movieAPI.update(editMovie.id, editMovieForm);
      alert('Movie updated successfully!');
      setEditMovie(null);
      fetchTabContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update movie.');
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTabContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchTabContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'MOVIES') {
        const res = await movieAPI.getAll(0, 50);
        setMovies(res.data?.content || []);
      } else if (activeTab === 'THEATERS') {
        const res = await adminAPI.getPendingTheaters();
        setPendingTheaters(res.data?.content || []);
      } else if (activeTab === 'USERS') {
        const res = await adminAPI.getUsers(0, 50);
        setUsers(res.data?.content || []);
      } else if (activeTab === 'BOOKINGS') {
        const res = await adminAPI.getBookings(0, 50);
        setBookings(res.data?.content || []);
      }
    } catch (err) {
      console.error('Error loading tab content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await movieAPI.create(movieForm);
      alert('Movie created successfully!');
      setShowAddMovieModal(false);
      fetchTabContent();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create movie.');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await movieAPI.delete(id);
      alert('Movie deleted.');
      fetchTabContent();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  const handleApproveTheater = async (id) => {
    try {
      await adminAPI.approveTheater(id);
      alert('Theater approved and activated!');
      fetchTabContent();
      fetchStats();
    } catch (err) {
      alert('Failed to approve theater.');
    }
  };

  const handleRejectTheater = async (id) => {
    try {
      await adminAPI.rejectTheater(id);
      alert('Theater rejected.');
      fetchTabContent();
      fetchStats();
    } catch (err) {
      alert('Failed to reject theater.');
    }
  };

  const handleToggleUser = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      fetchTabContent();
    } catch (err) {
      alert('Failed to toggle user status.');
    }
  };

  return (
    <div className="dashboard-page admin-dashboard-page">
      <div className="section-container py-10">
        <div className="page-header-row mb-8">
          <div>
            <div className="flex-center-gap">
              <span className="portal-badge-admin">MASTER ADMIN CONSOLE</span>
            </div>
            <h1 className="page-main-title mt-2">Platform Administration</h1>
            <p className="text-muted">Oversee catalog movies, verify theater applications, and monitor user bookings</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              to="/admin/movies"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              🌐 TMDB Import &amp; Catalog Hub
            </Link>
            <button
              className="btn-primary"
              onClick={() => setShowAddMovieModal(true)}
            >
              + Add New Movie
            </button>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="metrics-grid mb-10">
          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div>
              <span className="metric-number">{stats.totalUsers}</span>
              <span className="metric-label">Registered Users</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🎬</div>
            <div>
              <span className="metric-number">{stats.totalMovies}</span>
              <span className="metric-label">Movies in Catalog</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🏢</div>
            <div>
              <span className="metric-number">{stats.totalTheaters}</span>
              <span className="metric-label">Total Theaters</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🎟️</div>
            <div>
              <span className="metric-number">{stats.totalBookings}</span>
              <span className="metric-label">Total Bookings</span>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="dashboard-tabs-bar mb-6">
          <button
            className={`d-tab-btn ${activeTab === 'MOVIES' ? 'd-tab-active' : ''}`}
            onClick={() => setActiveTab('MOVIES')}
          >
            🎬 Movie Catalog ({movies.length})
          </button>
          <button
            className={`d-tab-btn ${activeTab === 'THEATERS' ? 'd-tab-active' : ''}`}
            onClick={() => setActiveTab('THEATERS')}
          >
            🏢 Pending Theaters ({stats.pendingTheaters})
          </button>
          <button
            className={`d-tab-btn ${activeTab === 'USERS' ? 'd-tab-active' : ''}`}
            onClick={() => setActiveTab('USERS')}
          >
            👥 User Management
          </button>
          <button
            className={`d-tab-btn ${activeTab === 'BOOKINGS' ? 'd-tab-active' : ''}`}
            onClick={() => setActiveTab('BOOKINGS')}
          >
            📊 All Bookings Feed
          </button>
        </div>

        {loading && (
          <div className="py-4 text-center"><div className="spinner-sm mr-2"></div><span className="text-muted text-sm">Loading data...</span></div>
        )}

        {/* Tab 1: Movies */}
        {activeTab === 'MOVIES' && (
          <div className="dashboard-content">
            <div className="dashboard-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Runtime</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(movie => (
                    <tr key={movie.id}>
                      <td>
                        <img
                          src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100'}
                          alt={movie.title}
                          className="table-thumb"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100';
                          }}
                        />
                      </td>
                      <td>
                        <strong>{movie.title}</strong>
                        <div className="text-xs text-muted">{movie.director}</div>
                      </td>
                      <td>{movie.genre}</td>
                      <td>{movie.durationMinutes} min</td>
                      <td>★ {movie.rating}</td>
                      <td>
                        <span className={`status-pill ${movie.status === 'NOW_SHOWING' ? 'status-now' : 'status-coming'}`}>
                          {movie.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary-sm"
                          style={{ marginRight: '6px' }}
                          onClick={() => openEditMovie(movie)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger-sm"
                          onClick={() => handleDeleteMovie(movie.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Pending Theaters */}
        {activeTab === 'THEATERS' && (
          <div className="dashboard-content">
            {pendingTheaters.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <h3>All Clear!</h3>
                <p>No theater venues currently awaiting verification or approval.</p>
              </div>
            ) : (
              <div className="dashboard-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Theater Name</th>
                      <th>Location</th>
                      <th>Owner</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTheaters.map(t => (
                      <tr key={t.id}>
                        <td><strong>{t.name}</strong></td>
                        <td>{t.address}, {t.city}</td>
                        <td>{t.owner?.username || 'Owner'}</td>
                        <td>{t.phoneNumber}</td>
                        <td><span className="badge-coming-soon">{t.status}</span></td>
                        <td>
                          <div className="flex-center-gap">
                            <button
                              className="btn-success-sm"
                              onClick={() => handleApproveTheater(t.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-danger-sm"
                              onClick={() => handleRejectTheater(t.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'USERS' && (
          <div className="dashboard-content">
            <div className="dashboard-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="font-mono">#{u.id}</td>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>
                        {u.roles?.map(r => (
                          <span key={r.id || r.name} className="role-tag-sm mr-1">
                            {r.name || r}
                          </span>
                        ))}
                      </td>
                      <td>
                        <span className={u.enabled ? 'text-green font-semibold' : 'text-red font-semibold'}>
                          {u.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary-sm"
                          onClick={() => handleToggleUser(u.id)}
                        >
                          {u.enabled ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Bookings Feed */}
        {activeTab === 'BOOKINGS' && (
          <div className="dashboard-content">
            <div className="dashboard-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Theater & Screen</th>
                    <th>Total ($)</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="font-mono"><strong>{b.bookingNumber}</strong></td>
                      <td>{b.user?.username || 'Customer'}</td>
                      <td>{b.show?.movie?.title}</td>
                      <td>{b.show?.screen?.theater?.name} ({b.show?.screen?.name})</td>
                      <td className="text-green font-bold">${b.finalAmount?.toFixed(2)}</td>
                      <td>{b.paymentMethod}</td>
                      <td>
                        <span className={`status-pill status-${b.bookingStatus?.toLowerCase()}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Movie */}
      {showAddMovieModal && (
        <div className="modal-backdrop" onClick={() => setShowAddMovieModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Movie to Catalog</h3>
              <button className="modal-close-btn" onClick={() => setShowAddMovieModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateMovie} className="p-6">
              <div className="form-group mb-4">
                <label>Movie Title</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Inception 2"
                  value={movieForm.title}
                  onChange={e => setMovieForm({ ...movieForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2 mb-4">
                <div className="form-group">
                  <label>Genre</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={movieForm.genre}
                    onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={movieForm.language}
                    onChange={e => setMovieForm({ ...movieForm, language: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label>Description / Synopsis</label>
                <textarea
                  className="auth-input"
                  rows="3"
                  value={movieForm.description}
                  onChange={e => setMovieForm({ ...movieForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="form-grid-2 mb-4">
                <div className="form-group">
                  <label>Duration (Minutes)</label>
                  <input
                    type="number"
                    className="auth-input"
                    value={movieForm.durationMinutes}
                    onChange={e => setMovieForm({ ...movieForm, durationMinutes: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rating (out of 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="auth-input"
                    value={movieForm.rating}
                    onChange={e => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2 mb-4">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="auth-input"
                    value={movieForm.status}
                    onChange={e => setMovieForm({ ...movieForm, status: e.target.value })}
                  >
                    <option value="NOW_SHOWING">Now Showing</option>
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="ENDED">Ended</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Certification</label>
                  <select
                    className="auth-input"
                    value={movieForm.certification}
                    onChange={e => setMovieForm({ ...movieForm, certification: e.target.value })}
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental Guidance)</option>
                    <option value="A">A (Adult 18+)</option>
                  </select>
                </div>
              </div>

              <PosterUrlField
                id="dashboard-add-poster-url"
                value={movieForm.posterUrl}
                onChange={url => setMovieForm({ ...movieForm, posterUrl: url })}
                movieTitle={movieForm.title}
                required={true}
              />

              <div className="form-group mb-6">
                <label>YouTube Trailer URL</label>
                <input
                  type="url"
                  className="auth-input"
                  value={movieForm.trailerUrl}
                  onChange={e => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                />
              </div>

              <div className="flex-end-gap">
                <button type="button" className="btn-secondary" onClick={() => setShowAddMovieModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Movie</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {editMovie && editMovieForm && (
        <div className="modal-overlay" onClick={() => setEditMovie(null)}>
          <div className="modal-content-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Movie: {editMovie.title}</h2>
              <button className="modal-close" onClick={() => setEditMovie(null)}>×</button>
            </div>
            <form onSubmit={handleSaveEditMovie}>
              <div className="form-grid-2 mb-4">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={editMovieForm.title}
                    onChange={e => setEditMovieForm({ ...editMovieForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Director</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={editMovieForm.director}
                    onChange={e => setEditMovieForm({ ...editMovieForm, director: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2 mb-4">
                <div className="form-group">
                  <label>Genre</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={editMovieForm.genre}
                    onChange={e => setEditMovieForm({ ...editMovieForm, genre: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={editMovieForm.language}
                    onChange={e => setEditMovieForm({ ...editMovieForm, language: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-3 mb-4">
                <div className="form-group">
                  <label>Duration (mins)</label>
                  <input
                    type="number"
                    className="auth-input"
                    value={editMovieForm.durationMinutes}
                    onChange={e => setEditMovieForm({ ...editMovieForm, durationMinutes: parseInt(e.target.value, 10) || 120 })}
                  />
                </div>
                <div className="form-group">
                  <label>Rating (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="auth-input"
                    value={editMovieForm.rating}
                    onChange={e => setEditMovieForm({ ...editMovieForm, rating: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>Certification</label>
                  <select
                    className="auth-input"
                    value={editMovieForm.certification}
                    onChange={e => setEditMovieForm({ ...editMovieForm, certification: e.target.value })}
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental Guidance)</option>
                    <option value="A">A (Adult 18+)</option>
                  </select>
                </div>
              </div>

              <div className="form-group mb-4">
                <label>Status</label>
                <select
                  className="auth-input"
                  value={editMovieForm.status}
                  onChange={e => setEditMovieForm({ ...editMovieForm, status: e.target.value })}
                >
                  <option value="NOW_SHOWING">Now Showing</option>
                  <option value="COMING_SOON">Coming Soon</option>
                  <option value="ENDED">Ended</option>
                </select>
              </div>

              {/* Poster URL with Live Validation & Preview */}
              <PosterUrlField
                id="dashboard-edit-poster-url"
                value={editMovieForm.posterUrl}
                onChange={url => setEditMovieForm({ ...editMovieForm, posterUrl: url })}
                movieTitle={editMovieForm.title}
                required={true}
              />

              <div className="form-group mb-4">
                <label>Cast</label>
                <input
                  type="text"
                  className="auth-input"
                  value={editMovieForm.cast}
                  onChange={e => setEditMovieForm({ ...editMovieForm, cast: e.target.value })}
                />
              </div>

              <div className="form-group mb-4">
                <label>Description</label>
                <textarea
                  rows={3}
                  className="auth-input"
                  value={editMovieForm.description}
                  onChange={e => setEditMovieForm({ ...editMovieForm, description: e.target.value })}
                />
              </div>

              <div className="form-group mb-6">
                <label>YouTube Trailer URL</label>
                <input
                  type="text"
                  className="auth-input"
                  value={editMovieForm.trailerUrl}
                  onChange={e => setEditMovieForm({ ...editMovieForm, trailerUrl: e.target.value })}
                />
              </div>

              <div className="flex-end-gap">
                <button type="button" className="btn-secondary" onClick={() => setEditMovie(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingEdit}>
                  {savingEdit ? '⏳ Saving…' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
