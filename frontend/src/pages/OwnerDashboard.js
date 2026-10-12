import React, { useState, useEffect } from 'react';
import { theaterAPI, movieAPI, showAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('THEATERS'); // THEATERS, SCREENS, SHOWS
  const [theaters, setTheaters] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddTheaterModal, setShowAddTheaterModal] = useState(false);
  const [showAddScreenModal, setShowAddScreenModal] = useState(false);
  const [showAddShowModal, setShowAddShowModal] = useState(false);
  const [selectedTheaterForScreen, setSelectedTheaterForScreen] = useState(null);

  // Forms
  const [theaterForm, setTheaterForm] = useState({
    name: '',
    address: '',
    city: 'New York',
    state: 'NY',
    pincode: '10001',
    phoneNumber: '+1-555-0100',
    email: user?.email || '',
    amenities: 'IMAX Laser, Dolby Atmos, Luxury Recliners',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
  });

  const [screenForm, setScreenForm] = useState({
    name: 'Screen 2 - Dolby Atmos',
    screenType: 'IMAX',
    totalSeats: 50,
  });

  const [showForm, setShowForm] = useState({
    theaterId: '',
    screenId: '',
    movieId: '',
    startTime: '',
    priceRegular: 14.0,
    pricePremium: 18.0,
    priceVip: 24.0,
    priceRecliner: 28.0,
  });

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const [theatersRes, moviesRes] = await Promise.all([
        theaterAPI.getMyTheaters(0, 50),
        movieAPI.getAll(0, 50),
      ]);
      setTheaters(theatersRes.data?.content || []);
      setMovies(moviesRes.data?.content || []);
    } catch (err) {
      console.error('Error loading owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTheater = async (e) => {
    e.preventDefault();
    try {
      await theaterAPI.create(theaterForm);
      alert('Theater submitted successfully! (Status: PENDING_APPROVAL / ACTIVE)');
      setShowAddTheaterModal(false);
      fetchOwnerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create theater.');
    }
  };

  const handleAddScreen = async (e) => {
    e.preventDefault();
    if (!selectedTheaterForScreen) return;
    try {
      await theaterAPI.addScreen(selectedTheaterForScreen.id, screenForm);
      alert(`Screen added to ${selectedTheaterForScreen.name}! Seats auto-generated.`);
      setShowAddScreenModal(false);
      fetchOwnerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add screen.');
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!showForm.screenId || !showForm.movieId || !showForm.startTime) {
      alert('Please fill out all show requirements.');
      return;
    }

    try {
      const payload = {
        movie: { id: Number(showForm.movieId) },
        screen: { id: Number(showForm.screenId) },
        startTime: showForm.startTime,
        priceRegular: Number(showForm.priceRegular),
        pricePremium: Number(showForm.pricePremium),
        priceVip: Number(showForm.priceVip),
        priceRecliner: Number(showForm.priceRecliner),
        status: 'SCHEDULED',
      };
      await showAPI.create(payload);
      alert('Show scheduled successfully! Seats are now open for booking.');
      setShowAddShowModal(false);
      fetchOwnerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule show.');
    }
  };

  const allScreens = theaters.flatMap(t => (t.screens || []).map(s => ({ ...s, theaterName: t.name })));

  return (
    <div className="dashboard-page">
      <div className="section-container py-10">
        {/* Dashboard Title & Actions */}
        <div className="page-header-row mb-8">
          <div>
            <div className="flex-center-gap">
              <span className="portal-badge-owner">THEATER OWNER PORTAL</span>
            </div>
            <h1 className="page-main-title mt-2">Theater Management Console</h1>
            <p className="text-muted">Manage your multiplexes, audit auditoriums, and schedule movie showtimes</p>
          </div>
          <div className="action-buttons-group">
            <button
              className="btn-primary"
              onClick={() => setShowAddTheaterModal(true)}
            >
              + Register New Theater
            </button>
            <button
              className="btn-accent"
              onClick={() => setShowAddShowModal(true)}
            >
              + Schedule Movie Show
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="metrics-grid mb-10">
          <div className="metric-card">
            <div className="metric-icon">🏢</div>
            <div>
              <span className="metric-number">{theaters.length}</span>
              <span className="metric-label">Managed Theaters</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📽️</div>
            <div>
              <span className="metric-number">{allScreens.length}</span>
              <span className="metric-label">Active Screens</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🎬</div>
            <div>
              <span className="metric-number">{movies.length}</span>
              <span className="metric-label">Available Movies</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div>
              <span className="metric-number">$12,480</span>
              <span className="metric-label">Estimated Gross</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="dashboard-tabs-bar mb-6">
          <button
            className={`d-tab-btn ${activeTab === 'THEATERS' ? 'd-tab-active' : ''}`}
            onClick={() => setActiveTab('THEATERS')}
          >
            🏢 My Theaters ({theaters.length})
          </button>
          <button
            className={`d-tab-btn ${activeTab === 'SCREENS' ? 'd-tab-active' : ''}`}
            onClick={() => setActiveTab('SCREENS')}
          >
            📽️ Screens & Seating ({allScreens.length})
          </button>
        </div>

        {/* Tab 1: Theaters */}
        {activeTab === 'THEATERS' && (
          <div className="dashboard-content">
            {loading ? (
              <div className="loading-state py-12"><div className="spinner mx-auto"></div><p className="mt-4 text-muted">Loading theaters...</p></div>
            ) : theaters.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏢</div>
                <h3>No Theaters Registered</h3>
                <p>Register your first cinema hall or multiplex to start selling tickets.</p>
                <button
                  className="btn-primary mt-4"
                  onClick={() => setShowAddTheaterModal(true)}
                >
                  Register Theater Now
                </button>
              </div>
            ) : (
              <div className="owner-theaters-grid">
                {theaters.map(theater => (
                  <div key={theater.id} className="owner-theater-card">
                    <div className="owner-theater-header">
                      <div>
                        <h3>{theater.name}</h3>
                        <p className="text-muted text-sm">📍 {theater.address}, {theater.city}, {theater.state}</p>
                      </div>
                      <span className={`status-pill ${theater.status === 'ACTIVE' ? 'status-now' : 'status-coming'}`}>
                        {theater.status}
                      </span>
                    </div>

                    <div className="owner-theater-body">
                      <p className="text-sm"><strong>Contact:</strong> {theater.phoneNumber} • {theater.email}</p>
                      <p className="text-sm text-muted"><strong>Amenities:</strong> {theater.amenities}</p>

                      <div className="owner-screens-box">
                        <div className="flex-between mb-2">
                          <span className="font-semibold text-sm">Auditoriums ({theater.screens?.length || 0})</span>
                          <button
                            className="btn-text-sm"
                            onClick={() => {
                              setSelectedTheaterForScreen(theater);
                              setShowAddScreenModal(true);
                            }}
                          >
                            + Add Screen
                          </button>
                        </div>
                        <div className="screens-tags-row">
                          {theater.screens?.map(scr => (
                            <span key={scr.id} className="screen-format-pill">
                              {scr.name} • {scr.screenType} ({scr.totalSeats} seats)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Screens */}
        {activeTab === 'SCREENS' && (
          <div className="dashboard-content">
            <div className="dashboard-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Screen ID</th>
                    <th>Theater</th>
                    <th>Screen Name</th>
                    <th>Technology / Format</th>
                    <th>Total Capacity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allScreens.map(scr => (
                    <tr key={scr.id}>
                      <td className="font-mono">#SCR-{scr.id}</td>
                      <td><strong>{scr.theaterName}</strong></td>
                      <td>{scr.name}</td>
                      <td><span className="badge-imax">{scr.screenType}</span></td>
                      <td>{scr.totalSeats} Seats</td>
                      <td><span className="text-green font-semibold">Active & Configured</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Theater */}
      {showAddTheaterModal && (
        <div className="modal-backdrop" onClick={() => setShowAddTheaterModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Theater</h3>
              <button className="modal-close-btn" onClick={() => setShowAddTheaterModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTheater} className="p-6">
              <div className="form-group mb-4">
                <label>Theater Name</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. MANA CINEMA Dolby IMAX"
                  value={theaterForm.name}
                  onChange={e => setTheaterForm({ ...theaterForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-grid-2 mb-4">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={theaterForm.city}
                    onChange={e => setTheaterForm({ ...theaterForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={theaterForm.state}
                    onChange={e => setTheaterForm({ ...theaterForm, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-4">
                <label>Street Address</label>
                <input
                  type="text"
                  className="auth-input"
                  value={theaterForm.address}
                  onChange={e => setTheaterForm({ ...theaterForm, address: e.target.value })}
                  required
                />
              </div>
              <div className="form-grid-2 mb-4">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={theaterForm.phoneNumber}
                    onChange={e => setTheaterForm({ ...theaterForm, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={theaterForm.email}
                    onChange={e => setTheaterForm({ ...theaterForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-6">
                <label>Amenities</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="IMAX, Dolby Atmos, 4DX, Recliners, Food Court"
                  value={theaterForm.amenities}
                  onChange={e => setTheaterForm({ ...theaterForm, amenities: e.target.value })}
                />
              </div>
              <div className="flex-end-gap">
                <button type="button" className="btn-secondary" onClick={() => setShowAddTheaterModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Register Theater</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Screen */}
      {showAddScreenModal && selectedTheaterForScreen && (
        <div className="modal-backdrop" onClick={() => setShowAddScreenModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Screen to {selectedTheaterForScreen.name}</h3>
              <button className="modal-close-btn" onClick={() => setShowAddScreenModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddScreen} className="p-6">
              <div className="form-group mb-4">
                <label>Screen Name</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Screen 2 - Dolby Cinema"
                  value={screenForm.name}
                  onChange={e => setScreenForm({ ...screenForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-grid-2 mb-4">
                <div className="form-group">
                  <label>Screen Type</label>
                  <select
                    className="auth-input"
                    value={screenForm.screenType}
                    onChange={e => setScreenForm({ ...screenForm, screenType: e.target.value })}
                  >
                    <option value="IMAX">IMAX 3D Laser</option>
                    <option value="STANDARD">Standard 2D</option>
                    <option value="FOUR_DX">4DX Motion</option>
                    <option value="THREE_D">RealD 3D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Total Seats</label>
                  <input
                    type="number"
                    className="auth-input"
                    min="20"
                    max="200"
                    value={screenForm.totalSeats}
                    onChange={e => setScreenForm({ ...screenForm, totalSeats: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted mb-6">💡 Individual seat rows (VIP, Premium, Regular) will be automatically generated.</p>
              <div className="flex-end-gap">
                <button type="button" className="btn-secondary" onClick={() => setShowAddScreenModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save & Generate Seats</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Show */}
      {showAddShowModal && (
        <div className="modal-backdrop" onClick={() => setShowAddShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Movie Show</h3>
              <button className="modal-close-btn" onClick={() => setShowAddShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateShow} className="p-6">
              <div className="form-group mb-4">
                <label>Select Movie</label>
                <select
                  className="auth-input"
                  value={showForm.movieId}
                  onChange={e => setShowForm({ ...showForm, movieId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Movie --</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title} ({m.durationMinutes} mins)</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-4">
                <label>Select Screen</label>
                <select
                  className="auth-input"
                  value={showForm.screenId}
                  onChange={e => setShowForm({ ...showForm, screenId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Screen --</option>
                  {allScreens.map(scr => (
                    <option key={scr.id} value={scr.id}>{scr.theaterName} - {scr.name} ({scr.screenType})</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-4">
                <label>Show Start Date & Time</label>
                <input
                  type="datetime-local"
                  className="auth-input"
                  value={showForm.startTime}
                  onChange={e => setShowForm({ ...showForm, startTime: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2 mb-6">
                <div className="form-group">
                  <label>Regular Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="auth-input"
                    value={showForm.priceRegular}
                    onChange={e => setShowForm({ ...showForm, priceRegular: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>VIP Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="auth-input"
                    value={showForm.priceVip}
                    onChange={e => setShowForm({ ...showForm, priceVip: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex-end-gap">
                <button type="button" className="btn-secondary" onClick={() => setShowAddShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Schedule Show</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
