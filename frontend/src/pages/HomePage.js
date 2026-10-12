import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { movieAPI } from '../api/api';

const LANGUAGE_TABS = [
  { key: 'ALL', label: 'All Languages', icon: '🌐' },
  { key: 'Telugu', label: 'Telugu', icon: '🎭' },
  { key: 'Hindi', label: 'Hindi', icon: '🎬' },
  { key: 'English', label: 'English', icon: '🎥' },
  { key: 'Tamil', label: 'Tamil', icon: '🎞' },
];

const HomePage = ({ selectedCity }) => {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [filteredNow, setFilteredNow] = useState([]);
  const [filteredSoon, setFilteredSoon] = useState([]);

  const [activeLang, setActiveLang] = useState('ALL');
  const [activeSection, setActiveSection] = useState('NOW_SHOWING'); // NOW_SHOWING | COMING_SOON
  const [searchTerm, setSearchTerm] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Fetch now-showing and coming-soon in parallel
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const [nowRes, soonRes] = await Promise.all([
        movieAPI.getNowShowing(0, 50),
        movieAPI.getComingSoon(0, 50),
      ]);
      setNowShowing(nowRes.data?.content || []);
      setComingSoon(soonRes.data?.content || []);
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGenres = useCallback(async () => {
    try {
      const res = await movieAPI.getGenres();
      setGenres(res.data || []);
    } catch {
      setGenres(['Action', 'Drama', 'Sci-Fi', 'Thriller', 'Romance', 'Comedy']);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, [fetchMovies, fetchGenres]);

  // Apply filters client-side
  useEffect(() => {
    const applyFilters = (list) => {
      let result = [...list];
      if (activeLang !== 'ALL') {
        result = result.filter(m => m.language && m.language.toLowerCase() === activeLang.toLowerCase());
      }
      if (selectedGenre !== 'ALL') {
        result = result.filter(m => m.genre && m.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        result = result.filter(m =>
          m.title?.toLowerCase().includes(q) ||
          m.genre?.toLowerCase().includes(q) ||
          m.cast?.toLowerCase().includes(q) ||
          m.director?.toLowerCase().includes(q)
        );
      }
      return result;
    };
    setFilteredNow(applyFilters(nowShowing));
    setFilteredSoon(applyFilters(comingSoon));
  }, [activeLang, selectedGenre, searchTerm, nowShowing, comingSoon]);

  const heroMovie = nowShowing.find(m => m.backdropUrl) || nowShowing[0] || comingSoon[0];

  const displayMovies = activeSection === 'NOW_SHOWING' ? filteredNow : filteredSoon;

  return (
    <div className="home-page-container">

      {/* ── Hero Banner ── */}
      {heroMovie && (
        <section
          className="hero-banner"
          style={heroMovie.backdropUrl ? {
            backgroundImage: `linear-gradient(to right, rgba(35,21,13,0.97) 38%, rgba(35,21,13,0.6) 70%, transparent 100%), url(${heroMovie.backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          } : {}}
        >
          <div className="hero-backdrop-glow"></div>
          <div className="hero-content-wrapper">
            <div className="hero-info-column">
              <div className="hero-badges-row">
                <span className="badge-exclusive">FEATURED BLOCKBUSTER</span>
                {heroMovie.genre?.includes('IMAX') ? <span className="badge-imax">IMAX LASER</span> : null}
                <span className="badge-city">📍 Now in {selectedCity}</span>
                {heroMovie.language && <span className="badge-lang">{heroMovie.language}</span>}
              </div>
              <h1 className="hero-title">{heroMovie.title}</h1>
              <div className="hero-meta-row">
                <span className="hero-rating">★ {heroMovie.rating ? (heroMovie.rating <= 5 ? (heroMovie.rating * 2).toFixed(1) : Number(heroMovie.rating).toFixed(1)) : '—'} / 10</span>
                <span className="meta-separator">•</span>
                <span>{heroMovie.durationMinutes ? `${heroMovie.durationMinutes} mins` : '—'}</span>
                <span className="meta-separator">•</span>
                <span>{heroMovie.genre?.split(',')[0]}</span>
                <span className="meta-separator">•</span>
                <span className="cert-pill">{heroMovie.certification || 'UA'}</span>
              </div>
              <p className="hero-description">{heroMovie.description?.substring(0, 200)}{heroMovie.description?.length > 200 ? '…' : ''}</p>
              <div className="hero-actions-row">
                <Link to={`/movie/${heroMovie.id}`} className="btn-hero-book">
                  🎟️ Book Tickets Now
                </Link>
                {heroMovie.trailerUrl && (
                  <a href={heroMovie.trailerUrl} target="_blank" rel="noopener noreferrer" className="btn-hero-trailer">
                    ▶ Watch Trailer
                  </a>
                )}
              </div>
            </div>
            <div className="hero-poster-column">
              <div className="hero-poster-frame">
                <img
                  src={heroMovie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600'}
                  alt={heroMovie.title}
                  className="hero-poster-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600';
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Controls Bar ── */}
      <section className="catalog-controls-section">
        <div className="section-container">

          {/* Section Tabs: Now Showing / Coming Soon */}
          <div className="section-status-tabs">
            <button
              className={`status-tab-btn ${activeSection === 'NOW_SHOWING' ? 'status-tab-active' : ''}`}
              onClick={() => setActiveSection('NOW_SHOWING')}
            >
              🔴 Now Showing
              <span className="count-badge">{filteredNow.length}</span>
            </button>
            <button
              className={`status-tab-btn ${activeSection === 'COMING_SOON' ? 'status-tab-active' : ''}`}
              onClick={() => setActiveSection('COMING_SOON')}
            >
              ⏳ Coming Soon
              <span className="count-badge">{filteredSoon.length}</span>
            </button>
          </div>

          {/* Language Filter Pills */}
          <div className="language-filter-pills">
            {LANGUAGE_TABS.map(lang => (
              <button
                key={lang.key}
                className={`lang-pill-btn ${activeLang === lang.key ? 'lang-pill-active' : ''}`}
                onClick={() => setActiveLang(lang.key)}
              >
                {lang.icon} {lang.label}
              </button>
            ))}
          </div>

          {/* Search & Genre Row */}
          <div className="controls-row">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                id="movie-search"
                type="text"
                placeholder="Search movie, cast, director…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>}
            </div>
            <select
              value={selectedGenre}
              onChange={e => setSelectedGenre(e.target.value)}
              className="genre-dropdown"
            >
              <option value="ALL">All Genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── Movie Grid ── */}
      <section className="movies-grid-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">
              {activeSection === 'NOW_SHOWING'
                ? `🔴 Now Showing${activeLang !== 'ALL' ? ` · ${activeLang}` : ''} in ${selectedCity}`
                : `⏳ Coming Soon${activeLang !== 'ALL' ? ` · ${activeLang}` : ''}`}
            </h2>
            <span className="results-count">{displayMovies.length} movies</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading cinema catalog…</p>
            </div>
          ) : displayMovies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <h3>No movies found</h3>
              <p>
                {activeLang !== 'ALL'
                  ? `No ${activeLang} movies available right now. Try another language.`
                  : 'Try adjusting your search or filters.'}
              </p>
              <button
                className="btn-secondary"
                onClick={() => { setActiveLang('ALL'); setSelectedGenre('ALL'); setSearchTerm(''); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="movies-grid">
              {displayMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Cinema Features ── */}
      <section className="cinema-features-section">
        <div className="section-container">
          <div className="features-grid">
            {[
              { icon: '🔊', title: 'Dolby Atmos Surround', desc: 'Multidimensional sound flowing all around you with breathtaking depth and clarity.' },
              { icon: '👁️', title: 'IMAX Laser Projection', desc: 'Next-generation 4K dual-laser digital projection with sharp contrast and vibrant colors.' },
              { icon: '🛋️', title: 'Ultra Luxury Recliners', desc: 'Motorized leather recliners with in-seat food ordering and personalized concierge.' },
              { icon: '📱', title: 'Instant QR E-Tickets', desc: 'Zero contact paperless entry directly through your phone with fast-track barcode scanning.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
