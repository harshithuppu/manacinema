import React, { useState, useEffect } from 'react';
import { theaterAPI } from '../api/api';

const TheatersPage = ({ selectedCity }) => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheaters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const fetchTheaters = async () => {
    setLoading(true);
    try {
      const res = await theaterAPI.getPublic({ city: selectedCity, page: 0, size: 20 });
      setTheaters(res.data?.content || []);
    } catch (err) {
      console.error('Error fetching theaters:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theaters-page">
      <div className="section-container py-10">
        <div className="page-header-row mb-8">
          <div>
            <h1 className="page-main-title">Cinemas & Partner Theaters</h1>
            <p className="text-muted">Explore high-fidelity auditoriums, IMAX venues, and sound experiences in <strong>{selectedCity}</strong></p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state py-20">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-muted">Locating nearby cinemas in {selectedCity}...</p>
          </div>
        ) : theaters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <h3>No theaters found in {selectedCity}</h3>
            <p>Please switch your city in the top bar navigation to discover more movie theaters.</p>
          </div>
        ) : (
          <div className="theaters-directory-grid">
            {theaters.map(theater => (
              <div key={theater.id} className="theater-listing-card">
                <div className="theater-cover-wrap">
                  <img
                    src={theater.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600'}
                    alt={theater.name}
                    className="theater-cover-img"
                  />
                  <div className="theater-status-badge">ACTIVE THEATER</div>
                </div>

                <div className="theater-card-content">
                  <h3 className="theater-name-title">{theater.name}</h3>
                  <p className="theater-location-line">📍 {theater.address}, {theater.city}, {theater.state} {theater.pincode}</p>
                  <p className="theater-contact-line">📞 {theater.phoneNumber} • ✉️ {theater.email}</p>

                  <div className="amenities-tags-wrap">
                    {theater.amenities?.split(',').map((amenity, idx) => (
                      <span key={idx} className="amenity-tag">
                        ✨ {amenity.trim()}
                      </span>
                    ))}
                  </div>

                  {theater.screens && theater.screens.length > 0 && (
                    <div className="theater-screens-summary">
                      <span className="text-muted text-xs uppercase tracking-wide">Screens & Formats:</span>
                      <div className="screens-pills-row">
                        {theater.screens.map(scr => (
                          <span key={scr.id} className="screen-format-pill">
                            {scr.name} ({scr.screenType})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TheatersPage;
