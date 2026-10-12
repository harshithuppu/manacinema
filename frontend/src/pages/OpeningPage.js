import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { movieAPI } from '../api/api';
import { TELANGANA_CITIES } from '../components/CitySelectorModal';

const EXPERIENCES = [
  {
    id: 'imax',
    title: 'IMAX® with Laser',
    badge: '4K DUAL LASER',
    icon: '👁️',
    gradient: 'from-amber-900 to-amber-700',
    description: 'Next-generation 4K dual laser projection delivering breathtaking sharpness, deeper contrast, and colossal floor-to-ceiling curved screens.',
    perks: ['Colossal 70mm Aspect Ratio', '12-Channel High-Precision Audio', 'Zero Glare Optic Screens'],
  },
  {
    id: 'atmos',
    title: 'Dolby Atmos® 360°',
    badge: 'SPATIAL AUDIO',
    icon: '🔊',
    gradient: 'from-blue-900 to-indigo-800',
    description: 'Breathtaking multidimensional object-based sound flowing above and around you with pinpoint precision so you feel every beat of the action.',
    perks: ['64 Independent Audio Channels', 'Ceiling Overhead Subwoofers', 'Studio-Grade Acoustic Tuning'],
  },
  {
    id: 'gold',
    title: 'Mana Gold Recliner Class',
    badge: 'ULTRA LUXURY',
    icon: '🛋️',
    gradient: 'from-yellow-800 to-amber-600',
    description: 'Motorized German leather recliners with private swivel tables, personal steward service, warm fleece blankets, and gourmet in-seat food service.',
    perks: ['180° Full Motorized Recline', 'In-Seat Butler Call Button', 'Complimentary Gourmet Popcorn'],
  },
  {
    id: 'gourmet',
    title: 'Gourmet In-Seat Dining',
    badge: 'CHEF CRAFTED',
    icon: '🍿',
    gradient: 'from-red-950 to-orange-800',
    description: 'Skip the concession stand lines! Scan the QR code on your seat armrest for hot gourmet snacks, artisan popcorn, and barista coffee brought to your seat.',
    perks: ['Zero-Contact QR In-Seat Ordering', 'Artisanal Caramel & Cheese Popcorn', 'Fresh Stone-Baked Thin Crust Pizzas'],
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Choose Movie & Theater',
    desc: 'Browse current blockbusters in Telugu, Hindi, English, and Tamil across premier multiplexes in your city.',
    icon: '🎬',
  },
  {
    num: '02',
    title: 'Pick Preferred Recliners',
    desc: 'Select your preferred seats using our interactive real-time layout with clear view angles and pricing.',
    icon: '💺',
  },
  {
    num: '03',
    title: 'Instant QR Entry',
    desc: 'Receive your mobile digital ticket immediately via SMS, WhatsApp, and email. Simply scan and enter!',
    icon: '📱',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sravan Kumar',
    city: 'Hyderabad',
    rating: 5,
    quote: 'The IMAX Laser screen and sound clarity are phenomenal. Booking recliners took less than 30 seconds!',
    tag: 'Verified Moviegoer',
  },
  {
    name: 'Ananya Reddy',
    city: 'Warangal',
    rating: 5,
    quote: 'Mana Cinema has revolutionized movie watching in Telangana. The in-seat food service is super convenient.',
    tag: 'Mana Gold Member',
  },
  {
    name: 'Vikram Joshi',
    city: 'Karimnagar',
    rating: 5,
    quote: 'Super clean multiplex, ultra-comfortable recliners, and zero queues at entry with the QR ticket.',
    tag: 'Regular Patron',
  },
];

const INITIAL_TMDB_MOVIES = [
  {
    id: 1001835,
    title: 'Kalki 2898 AD',
    originalTitle: 'Kalki 2898 AD',
    overview: 'A modern avatar of the Hindu god Vishnu descends on Earth to protect humanity in a dystopian futuristic Kasi.',
    releaseDate: '2024-06-27',
    voteAverage: 7.6,
    originalLanguage: 'te',
    runtime: 181,
    posterUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280',
    genres: [{ id: 878, name: 'Sci-Fi' }, { id: 28, name: 'Action' }],
    trailerKey: 'kQDd1AhGIHk',
    alreadyImported: true,
  },
  {
    id: 786892,
    title: 'Pushpa 2: The Rule',
    originalTitle: 'Pushpa 2: The Rule',
    overview: 'Pushpa Raj cements his rule over the red sandalwood smuggling empire amid fierce clashes and high-stakes drama.',
    releaseDate: '2024-12-05',
    voteAverage: 8.1,
    originalLanguage: 'te',
    runtime: 200,
    posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1280',
    genres: [{ id: 28, name: 'Action' }, { id: 80, name: 'Crime' }],
    trailerKey: '0PnQZ2hXv8k',
    alreadyImported: false,
  },
  {
    id: 945961,
    title: 'Devara: Part 1',
    originalTitle: 'Devara: Part 1',
    overview: 'An epic action saga set against turbulent coastal waters where a fearless leader protects his clan.',
    releaseDate: '2024-09-27',
    voteAverage: 7.4,
    originalLanguage: 'te',
    runtime: 178,
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1280',
    genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }],
    trailerKey: 's_GqF97B5_k',
    alreadyImported: false,
  },
  {
    id: 792307,
    title: 'Salaar: Part 1 – Ceasefire',
    originalTitle: 'Salaar',
    overview: 'A gang leader takes on rival criminal clans in the violent dystopian walled city-state of Khansaar.',
    releaseDate: '2023-12-22',
    voteAverage: 7.8,
    originalLanguage: 'te',
    runtime: 175,
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1280',
    genres: [{ id: 28, name: 'Action' }, { id: 80, name: 'Crime' }],
    trailerKey: '4GPvYMKtrtI',
    alreadyImported: false,
  },
  {
    id: 579974,
    title: 'RRR',
    originalTitle: 'RRR (Roudram Ranam Rudhiram)',
    overview: 'Two legendary revolutionaries embark on an unforgettable journey before fighting for India\'s freedom in the 1920s.',
    releaseDate: '2022-03-24',
    voteAverage: 8.2,
    originalLanguage: 'te',
    runtime: 187,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1280',
    genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }],
    trailerKey: 'NgBoMJy386M',
    alreadyImported: false,
  },
  {
    id: 1094556,
    title: 'Hanu-Man',
    originalTitle: 'Hanu-Man',
    overview: 'An ordinary young man in Anjanadri gains divine powers and stands against a modern supervillain.',
    releaseDate: '2024-01-12',
    voteAverage: 7.9,
    originalLanguage: 'te',
    runtime: 158,
    posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280',
    genres: [{ id: 28, name: 'Action' }, { id: 14, name: 'Fantasy' }],
    trailerKey: 'qeVd2_C1o1U',
    alreadyImported: false,
  },
  {
    id: 1064028,
    title: 'Stree 2: Sarkate Ka Aatank',
    originalTitle: 'Stree 2',
    overview: 'The town of Chanderi faces a terrifying headless entity, requiring the return of legendary protectors.',
    releaseDate: '2024-08-15',
    voteAverage: 7.7,
    originalLanguage: 'hi',
    runtime: 147,
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280',
    genres: [{ id: 35, name: 'Comedy' }, { id: 27, name: 'Horror' }],
    trailerKey: 'D0b2XpC4a98',
    alreadyImported: false,
  },
  {
    id: 994108,
    title: 'Guntur Kaaram',
    originalTitle: 'Guntur Kaaram',
    overview: 'A fiery man from Guntur is pressured to sever ties with his family, setting off a high-octane tempest.',
    releaseDate: '2024-01-12',
    voteAverage: 7.1,
    originalLanguage: 'te',
    runtime: 159,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1280',
    genres: [{ id: 28, name: 'Action' }, { id: 18, name: 'Drama' }],
    trailerKey: 'zB4wWb08f4U',
    alreadyImported: false,
  },
];

const TRAILER_KEYS_MAP = {
  1001835: 'kQDd1AhGIHk',
  786892: '0PnQZ2hXv8k',
  945961: 's_GqF97B5_k',
  792307: '4GPvYMKtrtI',
  579974: 'NgBoMJy386M',
  1094556: 'qeVd2_C1o1U',
  1064028: 'D0b2XpC4a98',
  994108: 'zB4wWb08f4U',
};

const OpeningPage = ({ selectedCity, setSelectedCity }) => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [tmdbMovies, setTmdbMovies] = useState(INITIAL_TMDB_MOVIES);
  const [loading, setLoading] = useState(true);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbLang, setTmdbLang] = useState('ALL');
  const [trailerModal, setTrailerModal] = useState(null);
  const [activeExpTab, setActiveExpTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [nowRes, soonRes, tmdbRes] = await Promise.all([
          movieAPI.getNowShowing(0, 8),
          movieAPI.getComingSoon(0, 4),
          movieAPI.tmdbPublicNowPlaying().catch(() => ({ data: [] })),
        ]);
        setFeaturedMovies(nowRes.data?.content || []);
        setComingSoonMovies(soonRes.data?.content || []);
        if (tmdbRes?.data && Array.isArray(tmdbRes.data) && tmdbRes.data.length > 0) {
          setTmdbMovies(tmdbRes.data);
        }
      } catch (err) {
        console.error('Error loading opening page data:', err);
      } finally {
        setLoading(false);
        setTmdbLoading(false);
      }
    };
    loadContent();
  }, []);

  const heroMovie = featuredMovies.find(m => m.backdropUrl) || featuredMovies[0];

  return (
    <div className="opening-page-container">
      {/* ── 1. CINEMATIC HERO OPENING ── */}
      <section
        className="opening-hero-section"
        style={
          heroMovie?.backdropUrl
            ? {
                backgroundImage: `linear-gradient(to right, rgba(28, 16, 9, 0.96) 35%, rgba(28, 16, 9, 0.78) 70%, rgba(28, 16, 9, 0.5) 100%), url(${heroMovie.backdropUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
              }
            : undefined
        }
      >
        <div className="opening-hero-overlay"></div>
        <div className="opening-hero-container">
          <div className="opening-hero-badge-wrap">
            <span className="opening-hero-pill-sparkle">✨ THE PREMIER CINEMATIC DESTINATION</span>
            <span className="opening-hero-pill-city">
              📍 Showing in <strong className="opening-city-highlight">{selectedCity || 'Hyderabad'}</strong>
            </span>
          </div>

          <h1 className="opening-hero-title">
            Step Into The Magic Of <br />
            <span className="opening-hero-gradient-text">MANA CINEMA</span>
          </h1>

          <p className="opening-hero-subtitle">
            Experience movies the way creators envisioned. Ultra 4K Laser Projection, 360° Dolby Atmos spatial sound,
            and motorized luxury recliners across Telangana&apos;s finest theaters.
          </p>

          <div className="opening-hero-actions">
            <Link to="/movies" className="btn-opening-primary">
              <span className="btn-icon">🎟️</span>
              <span>Explore Movies &amp; Book Tickets</span>
            </Link>
            <Link to="/theaters" className="btn-opening-secondary">
              <span className="btn-icon">🏛️</span>
              <span>Find Theaters in {selectedCity}</span>
            </Link>
            <a href="#experiences" className="btn-opening-outline">
              <span className="btn-icon">🍿</span>
              <span>VIP Experiences</span>
            </a>
          </div>

          {/* Key Metrics Strip */}
          <div className="opening-metrics-strip">
            <div className="opening-metric-item">
              <span className="metric-val">50+</span>
              <span className="metric-lbl">Modern Screens</span>
            </div>
            <div className="opening-metric-divider"></div>
            <div className="opening-metric-item">
              <span className="metric-val">4K Laser</span>
              <span className="metric-lbl">IMAX &amp; Dolby Atmos</span>
            </div>
            <div className="opening-metric-divider"></div>
            <div className="opening-metric-item">
              <span className="metric-val">100%</span>
              <span className="metric-lbl">Instant QR E-Tickets</span>
            </div>
            <div className="opening-metric-divider"></div>
            <div className="opening-metric-item">
              <span className="metric-val">4.9 ★</span>
              <span className="metric-lbl">Guest Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. QUICK CITY SELECTOR STRIP ── */}
      <section className="opening-cities-bar">
        <div className="section-container opening-cities-inner">
          <div className="cities-bar-label">
            <span className="pin-icon">📍</span>
            <span>Select Your City:</span>
          </div>
          <div className="cities-bar-scroll">
            {TELANGANA_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                className={`city-chip-btn ${selectedCity === city.name ? 'city-chip-active' : ''}`}
                onClick={() => setSelectedCity && setSelectedCity(city.name)}
              >
                <span className="city-chip-icon">{city.icon}</span>
                <span className="city-chip-name">{city.name}</span>
                {city.badge && <span className="city-chip-badge">{city.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. NOW SHOWING SPOTLIGHT ── */}
      <section className="opening-spotlight-section">
        <div className="section-container">
          <div className="opening-section-header">
            <div>
              <span className="section-eyebrow">NOW IN THEATERS</span>
              <h2 className="opening-section-title">Blockbusters Showing in {selectedCity}</h2>
              <p className="section-subtext">Catch the biggest premieres and fan favorites on the big screen today</p>
            </div>
            <Link to="/movies" className="opening-view-all-link">
              View All Movies &amp; Showtimes →
            </Link>
          </div>

          {loading ? (
            <div className="opening-loading-box">
              <div className="spinner"></div>
              <p>Loading premier cinema catalogue...</p>
            </div>
          ) : featuredMovies.length === 0 ? (
            <div className="opening-empty-box">
              <p>🎬 No showtimes found right now for {selectedCity}.</p>
              <Link to="/movies" className="btn-opening-primary">
                Browse Full Catalog
              </Link>
            </div>
          ) : (
            <div className="opening-movies-grid">
              {featuredMovies.slice(0, 8).map((movie) => (
                <div key={movie.id} className="opening-movie-card">
                  <div className="opening-poster-wrap">
                    <img
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500'}
                      alt={movie.title}
                      className="opening-poster-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500';
                      }}
                    />
                    <div className="opening-poster-badge-top">
                      {movie.certification && <span className="cert-tag">{movie.certification}</span>}
                      {movie.language && <span className="lang-tag">{movie.language}</span>}
                    </div>
                    <div className="opening-poster-overlay">
                      <Link to={`/movie/${movie.id}`} className="btn-card-quick-book">
                        🎟️ Book Tickets
                      </Link>
                    </div>
                  </div>
                  <div className="opening-card-details">
                    <h3 className="opening-card-title" title={movie.title}>
                      <Link to={`/movie/${movie.id}`}>{movie.title}</Link>
                    </h3>
                    <div className="opening-card-meta">
                      <span className="rating-pill">
                        ★ {movie.rating ? (movie.rating <= 5 ? (movie.rating * 2).toFixed(1) : Number(movie.rating).toFixed(1)) : '8.8'}
                      </span>
                      <span className="meta-genre">{movie.genre?.split(',')[0] || 'Drama'}</span>
                      {movie.durationMinutes && (
                        <span className="meta-duration">{movie.durationMinutes}m</span>
                      )}
                    </div>
                    <div className="opening-card-action">
                      <Link to={`/movie/${movie.id}`} className="btn-card-book-now">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="opening-view-all-banner">
            <div className="view-all-text">
              <h4>Looking for more movies, languages, or upcoming releases?</h4>
              <p>Filter by Telugu, Hindi, English, Tamil, genres, and exact theater venues.</p>
            </div>
            <Link to="/movies" className="btn-opening-primary">
              Go To Movies Hub →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3.5. TRENDING ON TMDB SECTION ── */}
      <section className="opening-spotlight-section" style={{ background: '#fcfaf7', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '64px 0' }}>
        <div className="section-container">
          <div className="opening-section-header" style={{ marginBottom: '28px' }}>
            <div>
              <span className="section-eyebrow" style={{ color: 'var(--primary)', fontWeight: 800 }}>🌐 LIVE TMDB REGISTRY SYNC</span>
              <h2 className="opening-section-title">🔥 Trending on TMDB (The Movie Database)</h2>
              <p className="section-subtext">
                Live movie metadata fetched through our secure Spring Boot TMDB proxy. Discover trending blockbusters, ratings, and upcoming titles across Telangana.
              </p>
            </div>
            <Link to="/movies" className="opening-view-all-link">
              Explore All Movies &amp; Showtimes →
            </Link>
          </div>

          {/* TMDB Language Filter Tabs */}
          <div className="tmdb-filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'All Blockbusters', icon: '🌐' },
              { key: 'te', label: 'Telugu (Tollywood)', icon: '🎭' },
              { key: 'hi', label: 'Hindi (Bollywood)', icon: '🎬' },
              { key: 'en', label: 'Hollywood / English', icon: '🎥' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`tmdb-filter-pill ${tmdbLang === tab.key ? 'active' : ''}`}
                onClick={() => setTmdbLang(tab.key)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '30px',
                  border: tmdbLang === tab.key ? '1px solid var(--primary)' : '1px solid #d8cec3',
                  background: tmdbLang === tab.key ? 'var(--primary)' : '#ffffff',
                  color: tmdbLang === tab.key ? '#ffffff' : 'var(--brown-dark)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: tmdbLang === tab.key ? '0 4px 14px var(--primary-glow)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {tmdbLoading ? (
            <div className="opening-loading-box">
              <div className="spinner"></div>
              <p>Fetching real-time TMDB trending blockbusters...</p>
            </div>
          ) : (
            <div className="opening-movies-grid">
              {tmdbMovies
                .filter(m => tmdbLang === 'ALL' || (m.originalLanguage || '').toLowerCase() === tmdbLang.toLowerCase())
                .slice(0, 8)
                .map((movie) => {
                  const trailerKey = movie.trailerKey || TRAILER_KEYS_MAP[movie.id] || 'kQDd1AhGIHk';
                  const isImported = Boolean(movie.alreadyImported || movie.already_imported);
                  return (
                    <div key={movie.id} className="opening-movie-card">
                      <div className="opening-poster-wrap">
                        <img
                          src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500'}
                          alt={movie.title}
                          className="opening-poster-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500';
                          }}
                        />
                        <div className="opening-poster-badge-top">
                          <span className="cert-tag" style={{ background: '#0284c7', color: '#fff' }}>TMDB</span>
                          <span className="lang-tag">
                            {movie.originalLanguage ? movie.originalLanguage.toUpperCase() : 'IN'}
                          </span>
                        </div>
                        {isImported && (
                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            background: 'rgba(46, 125, 50, 0.92)',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            zIndex: 2,
                          }}>
                            ✓ Playing in MANA
                          </div>
                        )}
                        <div className="opening-poster-overlay">
                          <button
                            type="button"
                            className="btn-card-quick-book"
                            onClick={() => setTrailerModal({ ...movie, trailerKey })}
                            style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.92)', color: 'var(--brown-dark)' }}
                          >
                            ▶ Watch Trailer
                          </button>
                        </div>
                      </div>
                      <div className="opening-card-details">
                        <h3 className="opening-card-title" title={movie.title}>
                          <Link to="/movies">{movie.title}</Link>
                        </h3>
                        <div className="opening-card-meta">
                          <span className="rating-pill">
                            ⭐ {movie.voteAverage ? movie.voteAverage.toFixed(1) : '8.0'}/10
                          </span>
                          <span className="meta-genre">{movie.releaseDate || 'In Theaters'}</span>
                          {movie.runtime ? <span className="meta-duration">{movie.runtime}m</span> : null}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '8px 0 12px', lineHeight: 1.45, height: '40px', overflow: 'hidden' }}>
                          {movie.overview ? movie.overview.substring(0, 85) + '…' : 'Featured cinema blockbuster metadata.'}
                        </p>
                        <div className="opening-card-action" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn-card-quick-book"
                            onClick={() => setTrailerModal({ ...movie, trailerKey })}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #d8cec3',
                              background: '#f8f4ee',
                              color: 'var(--brown-dark)',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            ▶ Trailer
                          </button>
                          <Link
                            to="/movies"
                            className="btn-card-book-now"
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: 'var(--primary)',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              textAlign: 'center',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            Book Shows
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. PREMIER EXPERIENCES SHOWCASE ── */}
      <section id="experiences" className="opening-experiences-section">
        <div className="section-container">
          <div className="opening-section-header text-center">
            <span className="section-eyebrow">UNMATCHED EXCELLENCE</span>
            <h2 className="opening-section-title">The Mana Cinema Experience</h2>
            <p className="section-subtext">Designed for true film enthusiasts who refuse to compromise on quality</p>
          </div>

          <div className="exp-tabs-nav">
            {EXPERIENCES.map((exp, idx) => (
              <button
                key={exp.id}
                type="button"
                className={`exp-tab-btn ${activeExpTab === idx ? 'exp-tab-active' : ''}`}
                onClick={() => setActiveExpTab(idx)}
              >
                <span className="exp-tab-icon">{exp.icon}</span>
                <span className="exp-tab-title">{exp.title}</span>
              </button>
            ))}
          </div>

          <div className="exp-showcase-card">
            <div className="exp-card-info">
              <span className="exp-badge">{EXPERIENCES[activeExpTab].badge}</span>
              <h3 className="exp-heading">{EXPERIENCES[activeExpTab].title}</h3>
              <p className="exp-description">{EXPERIENCES[activeExpTab].description}</p>
              <ul className="exp-perks-list">
                {EXPERIENCES[activeExpTab].perks.map((perk, i) => (
                  <li key={i} className="exp-perk-item">
                    <span className="check-bullet">✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="exp-actions">
                <Link to="/theaters" className="btn-opening-primary">
                  Find {EXPERIENCES[activeExpTab].title} Screens
                </Link>
                <Link to="/movies" className="btn-opening-outline-dark">
                  Browse Shows
                </Link>
              </div>
            </div>

            <div className="exp-card-visual">
              <div className="exp-visual-inner">
                <div className="visual-graphic-icon">{EXPERIENCES[activeExpTab].icon}</div>
                <div className="visual-caption">
                  <span className="visual-bold">PREMIER STANDARD</span>
                  <span>Certified High-Fidelity Theaters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS (3 SIMPLE STEPS) ── */}
      <section className="opening-steps-section">
        <div className="section-container">
          <div className="opening-section-header text-center">
            <span className="section-eyebrow">SEAMLESS &amp; CONTACTLESS</span>
            <h2 className="opening-section-title">Book Your Tickets in 3 Easy Steps</h2>
            <p className="section-subtext">No box office queues. No paper tickets. Just instant cinematic delight.</p>
          </div>

          <div className="opening-steps-grid">
            {STEPS.map((step) => (
              <div key={step.num} className="opening-step-card">
                <div className="step-num-badge">{step.num}</div>
                <div className="step-icon-wrap">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="steps-cta-center">
            <button
              type="button"
              className="btn-opening-primary"
              onClick={() => navigate('/movies')}
            >
              Start Booking Now 🎟️
            </button>
          </div>
        </div>
      </section>

      {/* ── 6. UPCOMING BLOCKBUSTERS PREVIEW ── */}
      {comingSoonMovies.length > 0 && (
        <section className="opening-coming-soon-section">
          <div className="section-container">
            <div className="opening-section-header">
              <div>
                <span className="section-eyebrow">COMING SOON</span>
                <h2 className="opening-section-title">Anticipated Releases</h2>
                <p className="section-subtext">Mark your calendar for the most awaited cinema spectacles</p>
              </div>
              <Link to="/movies" className="opening-view-all-link">
                View All Upcoming Films →
              </Link>
            </div>

            <div className="coming-soon-grid">
              {comingSoonMovies.map((movie) => (
                <div key={movie.id} className="coming-soon-card">
                  <div className="coming-soon-poster">
                    <img
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500'}
                      alt={movie.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500';
                      }}
                    />
                    <div className="coming-soon-overlay-badge">
                      <span>⏳ RELEASING SOON</span>
                    </div>
                  </div>
                  <div className="coming-soon-info">
                    <h4 className="coming-soon-title">{movie.title}</h4>
                    <p className="coming-soon-meta">
                      {movie.language || 'Telugu'} • {movie.genre?.split(',')[0] || 'Action'}
                    </p>
                    <Link to={`/movie/${movie.id}`} className="btn-coming-details">
                      View Preview &amp; Trailer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. MANA PREMIERE CLUB VIP PASS ── */}
      <section className="opening-vip-club-section">
        <div className="section-container">
          <div className="vip-club-banner">
            <div className="vip-club-content">
              <span className="vip-badge">👑 MANA PREMIERE CLUB</span>
              <h2 className="vip-title">Unlock VIP Cinema Privileges</h2>
              <p className="vip-subtitle">
                Join over 250,000+ moviegoers in Telangana enjoying exclusive discounts, free seat upgrades, and zero
                cancellation fees.
              </p>
              <div className="vip-perks-row">
                <div className="vip-perk">
                  <span className="vip-perk-icon">🎁</span>
                  <span>10% Cashback on All Tickets</span>
                </div>
                <div className="vip-perk">
                  <span className="vip-perk-icon">⚡</span>
                  <span>Priority First-Day-First-Show Access</span>
                </div>
                <div className="vip-perk">
                  <span className="vip-perk-icon">🍿</span>
                  <span>Complimentary Popcorn Upgrades</span>
                </div>
                <div className="vip-perk">
                  <span className="vip-perk-icon">🛡️</span>
                  <span>Zero Fee Ticket Rescheduling</span>
                </div>
              </div>
              <div className="vip-action-row">
                <Link to="/register" className="btn-vip-join">
                  Join Mana Club — Free Membership
                </Link>
                <Link to="/login" className="btn-vip-signin">
                  Existing Member? Sign In
                </Link>
              </div>
            </div>
            <div className="vip-card-visual">
              <div className="vip-mock-card">
                <div className="mock-card-header">
                  <span>MANA CINEMA</span>
                  <span className="gold-text">VIP BLACK</span>
                </div>
                <div className="mock-card-chip">💳</div>
                <div className="mock-card-number">•••• •••• •••• 2026</div>
                <div className="mock-card-footer">
                  <div>
                    <span className="lbl">MEMBER</span>
                    <span className="val">PREMIERE PATRON</span>
                  </div>
                  <div>
                    <span className="lbl">TIER</span>
                    <span className="val">DIAMOND VIP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. CUSTOMER TESTIMONIALS ── */}
      <section className="opening-testimonials-section">
        <div className="section-container">
          <div className="opening-section-header text-center">
            <span className="section-eyebrow">WHAT MOVIEGOERS SAY</span>
            <h2 className="opening-section-title">Loved by Thousands Across Telangana</h2>
            <p className="section-subtext">Hear from guests who choose Mana Cinema for their blockbuster nights</p>
          </div>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {'★'.repeat(t.rating)}
                </div>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name[0]}</div>
                  <div>
                    <h5 className="author-name">{t.name}</h5>
                    <span className="author-meta">
                      {t.city} • <span className="text-primary">{t.tag}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. BOTTOM HERO CALL TO ACTION ── */}
      <section className="opening-bottom-cta">
        <div className="section-container text-center">
          <h2 className="bottom-cta-title">Ready for Your Next Cinematic Journey?</h2>
          <p className="bottom-cta-sub">
            Book now in <strong>{selectedCity}</strong> to reserve the best recliners and enjoy an unforgettable evening.
          </p>
          <div className="bottom-cta-buttons">
            <Link to="/movies" className="btn-opening-primary btn-large">
              Book Tickets Now 🎟️
            </Link>
            <Link to="/theaters" className="btn-opening-secondary btn-large">
              Explore Theaters 🏛️
            </Link>
          </div>
        </div>
      </section>

      {/* ── TMDB TRAILER MODAL ── */}
      {trailerModal && (
        <div
          className="modal-overlay"
          onClick={() => setTrailerModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(24, 12, 6, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="trailer-modal-box"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '860px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                background: 'linear-gradient(135deg, #2b170c 0%, #1c0f07 100%)',
                color: '#fff',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f7d5a5', fontWeight: 800 }}>
                  🎬 {trailerModal.title} — Official Trailer
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#c5b4a5' }}>
                  TMDB Rating: ⭐ {trailerModal.voteAverage?.toFixed(1) || '8.0'}/10 · {trailerModal.releaseDate}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTrailerModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailerModal.trailerKey}?autoplay=1&rel=0`}
                title={`${trailerModal.title} Trailer`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf7f2', gap: '20px', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', flex: 1, minWidth: '240px', lineHeight: 1.5 }}>
                {trailerModal.overview}
              </p>
              <Link
                to="/movies"
                className="btn-opening-primary"
                onClick={() => setTrailerModal(null)}
                style={{ whiteSpace: 'nowrap' }}
              >
                Book Tickets for this Movie 🎟️
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpeningPage;
