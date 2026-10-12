import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theaterAPI } from '../api/api';
import CitySelectorModal, { TELANGANA_CITIES } from './CitySelectorModal';

const Navbar = ({ selectedCity, setSelectedCity }) => {
  const { user, isAuthenticated, logout, isAdmin, isOwner } = useAuth();
  const [cities, setCities] = useState(() => [
    ...TELANGANA_CITIES.map(c => c.name),
    'New York',
    'Los Angeles'
  ]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    theaterAPI.getCities()
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Merge unique cities preserving Telangana cities at top
          const tgNames = TELANGANA_CITIES.map(c => c.name);
          const combined = Array.from(new Set([...tgNames, ...res.data]));
          setCities(combined);
        }
      })
      .catch(() => {
        // fallback to Telangana cities already set in initial state
      });
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar-container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <div className="brand-logo-icon">🎬</div>
            <div className="brand-text-wrap">
              <span className="brand-name">MANA <span className="text-red">CINEMA</span></span>
              <span className="brand-tagline">CINEMA BOOKING</span>
            </div>
          </Link>

          {/* City Selector Button — opens modal */}
          <div className="city-selector-wrap">
            <button
              type="button"
              className="city-selector-trigger-btn"
              onClick={() => setIsCityModalOpen(true)}
              title="Select City (Telangana & Major Hubs)"
              id="city-selector-btn"
            >
              <span className="city-pin-icon">📍</span>
              <span className="city-name-current">{selectedCity || 'Hyderabad'}</span>
              <span className="city-dropdown-arrow">▾</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className={`nav-links ${menuOpen ? 'nav-links-mobile-open' : ''}`}>
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className={`nav-link ${isActive('/movies') ? 'nav-link-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              to="/theaters"
              className={`nav-link ${isActive('/theaters') ? 'nav-link-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Theaters
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`nav-link ${isActive('/my-bookings') ? 'nav-link-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                My Bookings
              </Link>
            )}

            {isOwner && (
              <Link
                to="/owner-dashboard"
                className={`nav-link portal-link owner-portal ${isActive('/owner-dashboard') ? 'nav-link-active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                🎬 Owner Portal
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin-dashboard"
                  className={`nav-link portal-link admin-portal ${isActive('/admin-dashboard') ? 'nav-link-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  🔑 Admin Console
                </Link>
                <Link
                  to="/admin/movies"
                  className={`nav-link portal-link admin-portal ${isActive('/admin/movies') ? 'nav-link-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  🎬 TMDB &amp; Movies
                </Link>
              </>
            )}
          </div>

          {/* User Account / Auth Actions */}
          <div className="nav-auth-actions">
            {isAuthenticated ? (
              <div className="user-profile-menu">
                <button
                  className="user-profile-button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="user-avatar-circle">
                    {user?.firstName ? user.firstName[0].toUpperCase() : user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-info-text">
                    <span className="user-name">{user?.firstName || user?.username}</span>
                    <span className="user-role-badge">
                      {isAdmin ? 'ADMIN' : isOwner ? 'OWNER' : 'CUSTOMER'}
                    </span>
                  </div>
                  <span className="chevron-down">▾</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-user-header">
                      <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-muted font-mono">{user?.email}</p>
                    </div>
                    <hr className="dropdown-divider" />
                    <Link
                      to="/my-bookings"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      🎟️ My Tickets &amp; Bookings
                    </Link>
                    {isOwner && (
                      <Link
                        to="/owner-dashboard"
                        className="dropdown-item text-amber"
                        onClick={() => setDropdownOpen(false)}
                      >
                        🎬 Theater Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <>
                        <Link
                          to="/admin-dashboard"
                          className="dropdown-item text-red"
                          onClick={() => setDropdownOpen(false)}
                        >
                          🔑 Admin Console
                        </Link>
                        <Link
                          to="/admin/movies"
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          🎬 TMDB Movies Hub
                        </Link>
                      </>
                    )}
                    <hr className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item text-red">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-wrap">
                <Link to="/login" className="btn-nav-login">Sign In</Link>
                <Link to="/register" className="btn-nav-register">Register</Link>
              </div>
            )}

            {/* Mobile hamburger button */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* City Selection Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        allCities={cities}
      />
    </>
  );
};

export default Navbar;
