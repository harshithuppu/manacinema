import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieAPI, showAPI } from '../api/api';

const MovieDetailsPage = ({ selectedCity }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate next 5 dates
  const availableDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    fetchMovieDetails();
    fetchShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedCity, selectedDate]);

  const fetchMovieDetails = async () => {
    try {
      const res = await movieAPI.getById(id);
      setMovie(res.data);
    } catch (err) {
      setError('Failed to load movie details');
    }
  };

  const fetchShows = async () => {
    setLoading(true);
    try {
      // First try to search by movie, city and date
      const res = await showAPI.getByMovieCityDate(id, selectedCity, selectedDate);
      if (res.data && res.data.length > 0) {
        setShows(res.data);
      } else {
        // Fallback: get all shows for this movie
        const allShowsRes = await showAPI.getByMovie(id);
        setShows(allShowsRes.data || []);
      }
    } catch (err) {
      // Fallback: get all shows for this movie
      try {
        const allShowsRes = await showAPI.getByMovie(id);
        setShows(allShowsRes.data || []);
      } catch (e) {
        setShows([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (error || (!loading && !movie)) {
    return (
      <div className="section-container text-center py-16">
        <h2>Movie not found</h2>
        <p className="text-muted">The requested movie could not be loaded.</p>
        <Link to="/movies" className="btn-primary mt-4 inline-block">Browse All Movies</Link>
      </div>
    );
  }

  // Group shows by Theater
  const showsByTheater = shows.reduce((acc, show) => {
    const theater = show.screen?.theater || { id: 0, name: 'Cinema Theater', city: selectedCity };
    const tId = theater.id || 0;
    if (!acc[tId]) {
      acc[tId] = { theater, shows: [] };
    }
    acc[tId].shows.push(show);
    return acc;
  }, {});

  const formatShowTime = (startTimeStr) => {
    try {
      const d = new Date(startTimeStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return startTimeStr;
    }
  };

  return (
    <div className="movie-details-page">
      {/* Movie Hero Header */}
      {movie && (
        <section className="movie-header-section">
          <div className="backdrop-overlay"></div>
          <div className="section-container">
            <div className="movie-header-grid">
              {/* Poster */}
              <div className="movie-header-poster">
                <img
                  src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500'}
                  alt={movie.title}
                  className="detail-poster-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500';
                  }}
                />
              </div>

              {/* Information */}
              <div className="movie-header-info">
                <div className="header-badges">
                  <span className={`status-pill ${movie.status === 'NOW_SHOWING' ? 'status-now' : 'status-coming'}`}>
                    {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}
                  </span>
                  <span className="badge-cert">{movie.certification || 'UA'}</span>
                  <span className="badge-lang">{movie.language || 'English'}</span>
                </div>

                <h1 className="movie-detail-title">{movie.title}</h1>

                <div className="detail-meta-list">
                  <span className="rating-pill">★ {movie.rating ? (movie.rating <= 5 ? (movie.rating * 2).toFixed(1) : Number(movie.rating).toFixed(1)) : '8.8'} / 10</span>
                  <span>⏱️ {movie.durationMinutes} mins</span>
                  <span>🎭 {movie.genre}</span>
                  <span>📅 Released: {movie.releaseDate || '2024'}</span>
                </div>

                <div className="detail-synopsis">
                  <h3>Synopsis</h3>
                  <p>{movie.description}</p>
                </div>

                <div className="detail-credits">
                  {movie.director && (
                    <div className="credit-item">
                      <span className="credit-label">Director:</span>
                      <span className="credit-val">{movie.director}</span>
                    </div>
                  )}
                  {movie.cast && (
                    <div className="credit-item">
                      <span className="credit-label">Cast:</span>
                      <span className="credit-val">{movie.cast}</span>
                    </div>
                  )}
                </div>

                {movie.trailerUrl && (
                  <div className="trailer-action-row">
                    <a
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-trailer-watch"
                    >
                      ▶ Watch Official Trailer
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Showtimes Booking Section */}
      <section className="showtimes-section">
        <div className="section-container">
          <div className="showtimes-header">
            <h2>Select Date & Showtime</h2>
            <span className="city-note">Showing theaters in <strong>{selectedCity}</strong></span>
          </div>

          {/* Date Picker Bar */}
          <div className="date-picker-scroll">
            {availableDates.map(d => (
              <button
                key={d.iso}
                className={`date-pill ${selectedDate === d.iso ? 'date-pill-active' : ''}`}
                onClick={() => setSelectedDate(d.iso)}
              >
                <span className="date-day">{d.dayName}</span>
                <span className="date-num">{d.dateNum}</span>
                <span className="date-month">{d.month}</span>
              </button>
            ))}
          </div>

          {/* Theaters List */}
          {loading ? (
            <div className="loading-state py-12">
              <div className="spinner"></div>
              <p>Fetching theater showtimes...</p>
            </div>
          ) : Object.keys(showsByTheater).length === 0 ? (
            <div className="no-shows-card">
              <div className="empty-icon">🎟️</div>
              <h3>No showtimes available for {selectedDate}</h3>
              <p>There are currently no active shows scheduled for this date in {selectedCity}. Please select another date or check other theaters.</p>
            </div>
          ) : (
            <div className="theaters-showtimes-list">
              {Object.values(showsByTheater).map(({ theater, shows: theaterShows }) => (
                <div key={theater.id} className="theater-showtime-card">
                  <div className="theater-card-info">
                    <div className="theater-title-row">
                      <h3 className="theater-name">📍 {theater.name}</h3>
                      <span className="theater-amenities-tag">{theater.amenities?.split(',')[0] || 'Dolby Cinema'}</span>
                    </div>
                    <p className="theater-address">{theater.address}, {theater.city}</p>
                  </div>

                  <div className="showtimes-buttons-group">
                    {theaterShows.map(show => (
                      <button
                        key={show.id}
                        className="showtime-btn"
                        onClick={() => navigate(`/book/${show.id}`)}
                      >
                        <span className="showtime-time">{formatShowTime(show.startTime)}</span>
                        <div className="showtime-tags">
                          <span className="screen-tag">{show.screen?.name || 'Screen 1'}</span>
                          <span className="type-tag">{show.screen?.screenType || 'IMAX'}</span>
                        </div>
                        <span className="price-tag">${show.priceRegular?.toFixed(2) || '14.00'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MovieDetailsPage;
