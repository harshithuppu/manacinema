import React, { useState, useEffect } from 'react';

// Telangana Real Cities with Coordinates and Top Theaters
export const TELANGANA_CITIES = [
  {
    name: 'Hyderabad',
    state: 'Telangana',
    tagline: 'Capital & Tech Hub',
    landmark: 'Charminar & HiTec City',
    theaters: 'Prasads IMAX, AMB Cinemas, PVR Inorbit',
    icon: '🏛️',
    badge: 'Popular',
    lat: 17.3850,
    lng: 78.4867,
  },
  {
    name: 'Warangal',
    state: 'Telangana',
    tagline: 'Heritage City of Kakatiyas',
    landmark: 'Thousand Pillar Temple & Fort',
    theaters: 'Asian Sridevi Mall & Multiplex',
    icon: '🏰',
    badge: 'Major Hub',
    lat: 17.9689,
    lng: 79.5941,
  },
  {
    name: 'Karimnagar',
    state: 'Telangana',
    tagline: 'City of Granites',
    landmark: 'Lower Manair Dam & Elgandal',
    theaters: 'Tirumala Multiplex 4K Dolby',
    icon: '🌆',
    badge: 'North TG',
    lat: 18.4386,
    lng: 79.1288,
  },
  {
    name: 'Nizamabad',
    state: 'Telangana',
    tagline: 'Gateway of Indur',
    landmark: 'Ashok Sagar & Nizamabad Fort',
    theaters: 'Usha Multiplex 7.1 Atmos',
    icon: '🏢',
    badge: 'North-West TG',
    lat: 18.6725,
    lng: 78.0941,
  },
  {
    name: 'Khammam',
    state: 'Telangana',
    tagline: 'Stambhadri City',
    landmark: 'Khammam Fort & Lakaram Lake',
    theaters: 'Srinivasa Complex Dolby Atmos',
    icon: '🏞️',
    badge: 'East TG',
    lat: 17.2473,
    lng: 80.1514,
  },
  {
    name: 'Nalgonda',
    state: 'Telangana',
    tagline: 'Neelagiri Foothills',
    landmark: 'Nagarjuna Sagar & Devarakonda',
    theaters: 'Sri Krishna Multiplex Laser',
    icon: '🌄',
    badge: 'South-East TG',
    lat: 17.0575,
    lng: 79.2684,
  },
  {
    name: 'Adilabad',
    state: 'Telangana',
    tagline: 'White Gold & Waterfalls',
    landmark: 'Kuntala Falls & Kawal Forest',
    theaters: 'Natraj Cinema 4K Projection',
    icon: '🌳',
    badge: 'North TG',
    lat: 19.6641,
    lng: 78.5320,
  },
];

// Haversine formula to find nearest city from GPS coordinates
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const CitySelectorModal = ({ isOpen, onClose, selectedCity, onSelectCity, allCities = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationStatus, setLocationStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter Telangana cities
  const filteredTelangana = TELANGANA_CITIES.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.landmark.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.theaters.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Other cities from backend not in Telangana list
  const otherCities = allCities.filter(
    (c) => !TELANGANA_CITIES.some((tc) => tc.name.toLowerCase() === c.toLowerCase())
  );

  const filteredOthers = otherCities.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Detect location via Browser Geolocation API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        loading: false,
        error: 'Geolocation is not supported by your browser. Please select your city manually below.',
        success: null,
      });
      return;
    }

    setLocationStatus({
      loading: true,
      error: null,
      success: null,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Find closest Telangana city
        let closestCity = TELANGANA_CITIES[0];
        let minDistance = Infinity;

        TELANGANA_CITIES.forEach((city) => {
          const dist = getDistanceKm(latitude, longitude, city.lat, city.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        });

        setLocationStatus({
          loading: false,
          error: null,
          success: `Detected nearest city: ${closestCity.name} (~${Math.round(minDistance)} km away)`,
        });

        // Auto select and close after small delay so user sees feedback
        setTimeout(() => {
          onSelectCity(closestCity.name);
          onClose();
        }, 800);
      },
      (error) => {
        let msg = 'Location request failed. Please select your city manually below.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can manually select your city below anytime!';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable. Please select your city manually below.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please select your city manually below.';
        }

        setLocationStatus({
          loading: false,
          error: msg,
          success: null,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCityPick = (cityName) => {
    onSelectCity(cityName);
    onClose();
  };

  return (
    <div className="city-modal-overlay" onClick={onClose}>
      <div
        className="city-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="city-modal-title"
      >
        {/* Header */}
        <div className="city-modal-header">
          <div className="city-modal-title-group">
            <span className="city-modal-header-icon">📍</span>
            <div>
              <h2 id="city-modal-title" className="city-modal-title">Select Your City</h2>
              <p className="city-modal-subtitle">
                Explore cinemas, IMAX shows & ticket bookings across <strong>Telangana</strong>
              </p>
            </div>
          </div>
          <button className="city-modal-close-btn" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        {/* Search & Location Bar */}
        <div className="city-modal-actions-bar">
          <div className="city-search-input-wrap">
            <span className="city-search-icon">🔍</span>
            <input
              type="text"
              className="city-search-input"
              placeholder="Search Telangana cities (e.g., Hyderabad, Warangal, Karimnagar...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <button
                className="city-search-clear"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className={`btn-detect-location ${locationStatus.loading ? 'loading' : ''}`}
            onClick={handleDetectLocation}
            disabled={locationStatus.loading}
          >
            <span className="detect-icon">🎯</span>
            <span>{locationStatus.loading ? 'Detecting...' : 'Detect My Location'}</span>
          </button>
        </div>

        {/* Location Alerts / Feedback */}
        {locationStatus.error && (
          <div className="city-location-alert city-location-alert-warning">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">
              <strong>Manual Selection Available:</strong> {locationStatus.error}
            </div>
          </div>
        )}

        {locationStatus.success && (
          <div className="city-location-alert city-location-alert-success">
            <span className="alert-icon">✅</span>
            <div className="alert-text">{locationStatus.success}</div>
          </div>
        )}

        {/* Modal Body: Telangana Cities Grid */}
        <div className="city-modal-body">
          <div className="city-section-header">
            <div className="city-section-title-wrap">
              <span className="tg-flag-badge">TELANGANA</span>
              <h3 className="city-section-title">Telangana Major Cities & Multiplex Hubs</h3>
            </div>
            <span className="city-count-badge">
              {filteredTelangana.length} {filteredTelangana.length === 1 ? 'City' : 'Cities'}
            </span>
          </div>

          {filteredTelangana.length === 0 ? (
            <div className="city-no-results">
              <span className="no-results-icon">🔍</span>
              <p>No Telangana city matches "<strong>{searchTerm}</strong>"</p>
              <button className="btn-clear-filter" onClick={() => setSearchTerm('')}>
                Show all Telangana cities
              </button>
            </div>
          ) : (
            <div className="city-cards-grid">
              {filteredTelangana.map((city) => {
                const isSelected = selectedCity?.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.name}
                    type="button"
                    className={`city-card-item ${isSelected ? 'city-card-selected' : ''}`}
                    onClick={() => handleCityPick(city.name)}
                  >
                    <div className="city-card-top">
                      <span className="city-card-icon">{city.icon}</span>
                      <span className="city-card-badge">{city.badge}</span>
                      {isSelected && <span className="city-card-active-pill">✓ Current</span>}
                    </div>

                    <div className="city-card-info">
                      <h4 className="city-card-name">{city.name}</h4>
                      <p className="city-card-tagline">{city.tagline}</p>
                      <p className="city-card-theaters">
                        <span className="theater-icon">🎬</span> {city.theaters}
                      </p>
                    </div>

                    <div className="city-card-footer">
                      <span className="city-card-state">{city.state}</span>
                      <span className="city-card-select-action">
                        {isSelected ? 'Selected' : 'Select →'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Other Regional / Available Hubs if present */}
          {filteredOthers.length > 0 && (
            <div className="other-cities-section">
              <h4 className="other-cities-title">Other Available Regions</h4>
              <div className="other-cities-chips">
                {filteredOthers.map((city) => {
                  const isSelected = selectedCity?.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      className={`city-chip ${isSelected ? 'city-chip-selected' : ''}`}
                      onClick={() => handleCityPick(city)}
                    >
                      <span className="chip-icon">📍</span>
                      <span className="chip-name">{city}</span>
                      {isSelected && <span className="chip-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="city-modal-footer">
          <p className="footer-city-tip">
            💡 <strong>Tip:</strong> You can switch your city anytime from the top bar to browse local showtimes and theaters.
          </p>
          <button className="btn-close-modal-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitySelectorModal;
