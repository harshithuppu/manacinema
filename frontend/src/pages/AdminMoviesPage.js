import React, { useState, useEffect, useCallback } from 'react';
import { movieAPI, theaterAPI, showAPI } from '../api/api';
import PosterUrlField from '../components/PosterUrlField';

const LANGUAGE_OPTIONS = ['Telugu', 'Hindi', 'English', 'Tamil', 'Malayalam', 'Kannada', 'Other'];
const STATUS_OPTIONS = ['NOW_SHOWING', 'COMING_SOON', 'ENDED'];
const CERT_OPTIONS = ['U', 'UA', 'A', 'S'];

const AdminMoviesPage = () => {
  // Local movie list state
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalMovies, setTotalMovies] = useState(0);

  // TMDB search state
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbSearched, setTmdbSearched] = useState(false);

  // Import dialog state
  const [importTarget, setImportTarget] = useState(null);
  const [importForm, setImportForm] = useState({ language: 'Telugu', status: 'NOW_SHOWING', director: '', cast: '', certification: 'UA' });
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);

  // Add Movie dialog state
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    genre: 'Action, Drama',
    language: 'Telugu',
    director: '',
    cast: '',
    releaseDate: new Date().toISOString().split('T')[0],
    durationMinutes: 150,
    posterUrl: '',
    trailerUrl: '',
    rating: 8.0,
    certification: 'UA',
    status: 'NOW_SHOWING',
  });
  const [addingMovie, setAddingMovie] = useState(false);
  const [addMsg, setAddMsg] = useState(null);

  // Edit dialog state
  const [editMovie, setEditMovie] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Theater & Showtime association modal state
  const [showModalMovie, setShowModalMovie] = useState(null);
  const [theaters, setTheaters] = useState([]);
  const [selectedTheaterId, setSelectedTheaterId] = useState('');
  const [screens, setScreens] = useState([]);
  const [existingShows, setExistingShows] = useState([]);
  const [showsLoading, setShowsLoading] = useState(false);
  const [showForm, setShowForm] = useState({
    screenId: '',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '18:30',
    priceRegular: 150,
    pricePremium: 250,
    priceVip: 350,
    priceRecliner: 450,
  });
  const [creatingShow, setCreatingShow] = useState(false);
  const [showMsg, setShowMsg] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterTitle, setFilterTitle] = useState('');

  // Tab
  const [activeTab, setActiveTab] = useState('local'); // 'local' | 'tmdb'

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 50 };
      if (filterStatus) params.status = filterStatus;
      if (filterLang) params.language = filterLang;
      if (filterTitle) params.title = filterTitle;
      const res = await movieAPI.search(params);
      setMovies(res.data?.content || []);
      setTotalMovies(res.data?.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterLang, filterTitle]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Auto-fetch TMDB popular movies when switching to TMDB tab
  useEffect(() => {
    if (activeTab === 'tmdb' && tmdbResults.length === 0 && !tmdbLoading) {
      handleTmdbNowPlaying();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── TMDB Search ──────────────────────────────────────────────────────────────
  const handleTmdbSearch = async (e, customQuery) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = customQuery !== undefined ? customQuery : tmdbQuery;
    if (!query || !query.trim()) return;
    if (customQuery !== undefined) setTmdbQuery(customQuery);
    setTmdbLoading(true);
    setTmdbSearched(true);
    try {
      let res;
      try {
        res = await movieAPI.tmdbSearch(query.trim());
      } catch {
        res = await movieAPI.tmdbPublicSearch(query.trim());
      }
      setTmdbResults(res?.data || []);
    } catch (err) {
      console.error('TMDB search error:', err);
      alert('TMDB search could not be completed.');
    } finally {
      setTmdbLoading(false);
    }
  };

  const handleTmdbNowPlaying = async () => {
    setTmdbLoading(true);
    setTmdbSearched(true);
    try {
      let res;
      try {
        res = await movieAPI.tmdbNowPlaying();
      } catch {
        res = await movieAPI.tmdbPublicNowPlaying();
      }
      setTmdbResults(res?.data || []);
    } catch (err) {
      console.error('TMDB now playing error:', err);
    } finally {
      setTmdbLoading(false);
    }
  };

  // ── Import flow ───────────────────────────────────────────────────────────────
  const openImportDialog = (tmdbMovie) => {
    setImportTarget(tmdbMovie);
    setImportMsg(null);
    const langMap = { te: 'Telugu', hi: 'Hindi', en: 'English', ta: 'Tamil', ml: 'Malayalam', kn: 'Kannada' };
    setImportForm({
      language: langMap[tmdbMovie.originalLanguage] || 'Telugu',
      status: 'NOW_SHOWING',
      director: '',
      cast: '',
      certification: 'UA',
    });
  };

  const handleImport = async () => {
    if (!importTarget) return;
    setImporting(true);
    setImportMsg(null);
    try {
      await movieAPI.tmdbImport({
        tmdbId: importTarget.id,
        language: importForm.language,
        status: importForm.status,
        director: importForm.director || undefined,
        cast: importForm.cast || undefined,
        certification: importForm.certification,
      });
      setImportMsg({ type: 'success', text: `"${importTarget.title}" imported successfully!` });
      // Update result state so card reflects imported
      setTmdbResults(prev => prev.map(m => m.id === importTarget.id ? { ...m, already_imported: true } : m));
      fetchMovies();
      setTimeout(() => setImportTarget(null), 1200);
    } catch (err) {
      setImportMsg({ type: 'error', text: err.response?.data?.message || 'Import failed.' });
    } finally {
      setImporting(false);
    }
  };

  // ── Edit dialog ──────────────────────────────────────────────────────────────
  const openEdit = (movie) => {
    setEditMovie(movie);
    setEditForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      language: movie.language || '',
      director: movie.director || '',
      cast: movie.cast || '',
      releaseDate: movie.releaseDate || '',
      durationMinutes: movie.durationMinutes || '',
      posterUrl: movie.posterUrl || '',
      trailerUrl: movie.trailerUrl || '',
      rating: movie.rating || '',
      certification: movie.certification || 'UA',
      status: movie.status || 'NOW_SHOWING',
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title?.trim()) {
      alert('Movie title is required.');
      return;
    }
    if (!editForm.posterUrl?.trim()) {
      alert('Poster URL is required.');
      return;
    }
    setSaving(true);
    try {
      await movieAPI.update(editMovie.id, editForm);
      setEditMovie(null);
      fetchMovies();
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMovie = async (e) => {
    if (e) e.preventDefault();
    if (!addForm.title?.trim()) {
      setAddMsg({ type: 'error', text: 'Movie title is required.' });
      return;
    }
    if (!addForm.posterUrl?.trim()) {
      setAddMsg({ type: 'error', text: 'Poster image URL is required.' });
      return;
    }
    setAddingMovie(true);
    setAddMsg(null);
    try {
      await movieAPI.create(addForm);
      setAddMsg({ type: 'success', text: `"${addForm.title}" added to local database successfully!` });
      fetchMovies();
      setTimeout(() => {
        setShowAddMovie(false);
        setAddMsg(null);
        setAddForm({
          title: '',
          description: '',
          genre: 'Action, Drama',
          language: 'Telugu',
          director: '',
          cast: '',
          releaseDate: new Date().toISOString().split('T')[0],
          durationMinutes: 150,
          posterUrl: '',
          trailerUrl: '',
          rating: 8.0,
          certification: 'UA',
          status: 'NOW_SHOWING',
        });
      }, 1000);
    } catch (err) {
      setAddMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add movie.' });
    } finally {
      setAddingMovie(false);
    }
  };

  // ── Status quick change ───────────────────────────────────────────────────────
  const handleStatusChange = async (movieId, newStatus) => {
    try {
      await movieAPI.updateStatus(movieId, newStatus);
      fetchMovies();
    } catch (e) {
      alert('Status update failed');
    }
  };

  const handleDelete = async (movie) => {
    if (!window.confirm(`Delete "${movie.title}" permanently?`)) return;
    try {
      await movieAPI.delete(movie.id);
      fetchMovies();
    } catch (e) {
      alert('Delete failed');
    }
  };

  // ── Showtime & Theater Linking ────────────────────────────────────────────────
  const openShowModal = async (movie) => {
    setShowModalMovie(movie);
    setShowMsg(null);
    setShowsLoading(true);
    try {
      const [theatersRes, showsRes] = await Promise.all([
        theaterAPI.getPublic({ size: 100 }),
        showAPI.getByMovie(movie.id),
      ]);
      const list = theatersRes.data?.content || [];
      setTheaters(list);
      setExistingShows(showsRes.data || []);
      if (list.length > 0) {
        setSelectedTheaterId(list[0].id);
        const screensRes = await theaterAPI.getScreens(list[0].id);
        const scrList = screensRes.data || [];
        setScreens(scrList);
        if (scrList.length > 0) {
          setShowForm(prev => ({ ...prev, screenId: scrList[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching shows/theaters:', err);
    } finally {
      setShowsLoading(false);
    }
  };

  const handleTheaterChange = async (tId) => {
    setSelectedTheaterId(tId);
    try {
      const screensRes = await theaterAPI.getScreens(tId);
      const scrList = screensRes.data || [];
      setScreens(scrList);
      if (scrList.length > 0) {
        setShowForm(prev => ({ ...prev, screenId: scrList[0].id }));
      } else {
        setShowForm(prev => ({ ...prev, screenId: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    if (!showForm.screenId) {
      alert('Please select a screen');
      return;
    }
    setCreatingShow(true);
    setShowMsg(null);
    try {
      const startTime = `${showForm.showDate}T${showForm.showTime}:00`;
      await showAPI.create({
        movie: { id: showModalMovie.id },
        screen: { id: Number(showForm.screenId) },
        startTime: startTime,
        priceRegular: Number(showForm.priceRegular),
        pricePremium: Number(showForm.pricePremium),
        priceVip: Number(showForm.priceVip),
        priceRecliner: Number(showForm.priceRecliner),
        status: 'SCHEDULED',
      });
      setShowMsg({ type: 'success', text: 'Showtime successfully scheduled & linked!' });
      const updated = await showAPI.getByMovie(showModalMovie.id);
      setExistingShows(updated.data || []);
    } catch (err) {
      setShowMsg({ type: 'error', text: err.response?.data?.message || 'Failed to schedule show (possible screening conflict).' });
    } finally {
      setCreatingShow(false);
    }
  };

  const handleCancelShow = async (showId) => {
    if (!window.confirm('Cancel this scheduled show?')) return;
    try {
      await showAPI.cancel(showId);
      const updated = await showAPI.getByMovie(showModalMovie.id);
      setExistingShows(updated.data || []);
    } catch (err) {
      alert('Failed to cancel show');
    }
  };

  const statusColor = (s) => {
    if (s === 'NOW_SHOWING') return '#15803d';
    if (s === 'COMING_SOON') return '#b45309';
    return '#6b7280';
  };

  const statusLabel = (s) => {
    if (s === 'NOW_SHOWING') return '🔴 Now Showing';
    if (s === 'COMING_SOON') return '🟡 Coming Soon';
    return '⚪ Ended';
  };

  return (
    <div className="admin-movies-page">
      {/* Page Header */}
      <div className="admin-movies-header">
        <div>
          <h1 className="admin-page-title">🎬 Movies Management</h1>
          <p className="admin-page-subtitle">
            Import movies from TMDB, edit metadata, manage status, and link directly to Telangana theaters &amp; showtimes.
          </p>
        </div>
        <div className="admin-tab-toggle">
          <button
            className={`tab-toggle-btn ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => setActiveTab('local')}
          >
            🗄 Local Database ({totalMovies})
          </button>
          <button
            className={`tab-toggle-btn ${activeTab === 'tmdb' ? 'active' : ''}`}
            onClick={() => setActiveTab('tmdb')}
          >
            🌐 Import from TMDB
          </button>
          <button
            className="tab-toggle-btn"
            style={{
              background: '#5c361e',
              color: '#ffffff',
              fontWeight: 800,
              marginLeft: '4px',
              boxShadow: '0 2px 6px rgba(92, 54, 30, 0.3)',
            }}
            onClick={() => setShowAddMovie(true)}
          >
            ➕ Add Movie
          </button>
        </div>
      </div>

      {/* ── LOCAL MOVIES TAB ── */}
      {activeTab === 'local' && (
        <div className="admin-local-tab">
          {/* Filters */}
          <div className="admin-filter-bar">
            <input
              className="admin-filter-input"
              placeholder="🔍 Search by title..."
              value={filterTitle}
              onChange={e => setFilterTitle(e.target.value)}
            />
            <select className="admin-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select className="admin-filter-select" value={filterLang} onChange={e => setFilterLang(e.target.value)}>
              <option value="">All Languages</option>
              {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="admin-loading-spinner"><div className="spinner"></div><p>Loading movies…</p></div>
          ) : movies.length === 0 ? (
            <div className="admin-empty-state">
              <span>🎬</span>
              <p>No movies found. Use the TMDB Import tab to add movies.</p>
            </div>
          ) : (
            <div className="admin-movies-table-wrap">
              <table className="admin-movies-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Language</th>
                    <th>Genre</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(movie => (
                    <tr key={movie.id} className="admin-movie-row">
                      <td>
                        <img
                          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100'}
                          alt={movie.title}
                          className="admin-movie-poster-thumb"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100';
                          }}
                        />
                      </td>
                      <td>
                        <div className="admin-movie-title-cell">
                          <strong>{movie.title}</strong>
                          {movie.releaseDate && <small>{movie.releaseDate}</small>}
                          {movie.durationMinutes > 0 && <small>{movie.durationMinutes} min</small>}
                        </div>
                      </td>
                      <td><span className="lang-chip">{movie.language || '—'}</span></td>
                      <td><span className="genre-chip">{movie.genre || '—'}</span></td>
                      <td>
                        <select
                          className="status-quick-select"
                          value={movie.status}
                          onChange={e => handleStatusChange(movie.id, e.target.value)}
                          style={{ color: statusColor(movie.status) }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                        </select>
                      </td>
                      <td>
                        {movie.rating ? (
                          <span className="rating-chip">⭐ {Number(movie.rating).toFixed(1)}</span>
                        ) : '—'}
                      </td>
                      <td>
                        {movie.importedFromTmdb
                          ? <span className="tmdb-badge">TMDB</span>
                          : <span className="local-badge">Local</span>}
                      </td>
                      <td>
                        <div className="admin-action-btns">
                          <button
                            className="btn-admin-shows"
                            onClick={() => openShowModal(movie)}
                            title="Link to Theaters &amp; Schedule Shows"
                          >
                            🗓️ Shows
                          </button>
                          <button className="btn-admin-edit" onClick={() => openEdit(movie)} title="Edit">✏️</button>
                          <button className="btn-admin-delete" onClick={() => handleDelete(movie)} title="Delete">🗑</button>
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

      {/* ── TMDB IMPORT TAB ── */}
      {activeTab === 'tmdb' && (
        <div className="admin-tmdb-tab">
          <div className="tmdb-info-banner">
            <span className="tmdb-info-icon">🔐</span>
            <p>
              <strong>Secure Backend Proxy:</strong> TMDB API key is kept safely in Spring Boot configuration.
              All requests are dispatched through the backend server.
            </p>
          </div>

          <div className="tmdb-search-bar">
            <form onSubmit={handleTmdbSearch} className="tmdb-search-form">
              <input
                className="tmdb-search-input"
                placeholder="Search TMDB — e.g. Kalki 2898 AD, Pushpa, Devara, RRR, Salaar…"
                value={tmdbQuery}
                onChange={e => setTmdbQuery(e.target.value)}
              />
              <button type="submit" className="btn-tmdb-search" disabled={tmdbLoading}>
                {tmdbLoading ? 'Searching…' : '🔍 Search TMDB'}
              </button>
            </form>
            <button className="btn-tmdb-popular" onClick={handleTmdbNowPlaying} disabled={tmdbLoading}>
              🎬 Browse India Now Playing
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>⚡ Quick Search:</span>
            {['Kalki 2898 AD', 'Pushpa 2', 'Devara', 'RRR', 'Salaar', 'Hanu-Man', 'Stree 2', 'Guntur Kaaram'].map(title => (
              <button
                key={title}
                type="button"
                onClick={() => handleTmdbSearch(null, title)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  background: tmdbQuery === title ? 'var(--primary)' : 'var(--surface-warm)',
                  color: tmdbQuery === title ? '#fff' : 'var(--primary-dark)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {title}
              </button>
            ))}
          </div>

          {tmdbLoading && (
            <div className="admin-loading-spinner"><div className="spinner"></div><p>Fetching from TMDB…</p></div>
          )}

          {!tmdbLoading && tmdbSearched && tmdbResults.length === 0 && (
            <div className="admin-empty-state">
              <span>🔍</span>
              <p>No TMDB results found. Try a different search term.</p>
            </div>
          )}

          {!tmdbLoading && tmdbResults.length > 0 && (
            <div className="tmdb-results-grid">
              {tmdbResults.map(movie => {
                const isImported = Boolean(movie.alreadyImported || movie.already_imported);
                return (
                  <div key={movie.id} className={`tmdb-result-card ${isImported ? 'already-imported' : ''}`}>
                    <div className="tmdb-card-poster-wrap">
                      <img
                        src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300'}
                        alt={movie.title}
                        className="tmdb-card-poster"
                      />
                      {isImported && (
                        <div className="imported-overlay">✓ Imported</div>
                      )}
                    </div>
                    <div className="tmdb-card-info">
                      <h4 className="tmdb-card-title">{movie.title}</h4>
                      <div className="tmdb-card-meta">
                        <span>📅 {movie.releaseDate || '—'}</span>
                        <span>⭐ {movie.voteAverage ? movie.voteAverage.toFixed(1) : '—'}/10</span>
                      </div>
                      <div className="tmdb-card-meta">
                        <span className="tmdb-lang-tag">🌐 {movie.originalLanguage?.toUpperCase()}</span>
                        {movie.runtime && <span>⏱ {movie.runtime} min</span>}
                      </div>
                      <p className="tmdb-card-overview">
                        {movie.overview ? movie.overview.substring(0, 100) + '…' : 'No description available.'}
                      </p>
                    </div>
                    <div className="tmdb-card-action">
                      {isImported ? (
                        <button className="btn-already-imported" disabled>✓ Already in Library</button>
                      ) : (
                        <button
                          className="btn-import-movie"
                          onClick={() => openImportDialog(movie)}
                        >
                          ⬇ Import to MANA CINEMA
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── IMPORT DIALOG ── */}
      {importTarget && (
        <div className="modal-overlay" onClick={() => setImportTarget(null)}>
          <div className="import-dialog" onClick={e => e.stopPropagation()}>
            <div className="import-dialog-header">
              <div className="import-dialog-title-wrap">
                <img
                  src={importTarget.posterUrl}
                  alt={importTarget.title}
                  className="import-dialog-poster"
                />
                <div>
                  <h3 className="import-dialog-title">{importTarget.title}</h3>
                  <p className="import-dialog-sub">
                    TMDB ID: {importTarget.id} · {importTarget.releaseDate}
                    · ⭐ {importTarget.voteAverage?.toFixed(1)}/10
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setImportTarget(null)}>✕</button>
            </div>

            <div className="import-dialog-body">
              <div className="import-form-grid">
                <div className="import-form-group">
                  <label>Language</label>
                  <select
                    value={importForm.language}
                    onChange={e => setImportForm(f => ({ ...f, language: e.target.value }))}
                    className="import-select"
                  >
                    {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="import-form-group">
                  <label>Status</label>
                  <select
                    value={importForm.status}
                    onChange={e => setImportForm(f => ({ ...f, status: e.target.value }))}
                    className="import-select"
                  >
                    <option value="NOW_SHOWING">🔴 Now Showing</option>
                    <option value="COMING_SOON">🟡 Coming Soon</option>
                    <option value="ENDED">⚪ Ended</option>
                  </select>
                </div>
                <div className="import-form-group">
                  <label>Certification</label>
                  <select
                    value={importForm.certification}
                    onChange={e => setImportForm(f => ({ ...f, certification: e.target.value }))}
                    className="import-select"
                  >
                    {CERT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="import-form-group">
                  <label>Director (optional)</label>
                  <input
                    className="import-input"
                    placeholder="e.g. S.S. Rajamouli"
                    value={importForm.director}
                    onChange={e => setImportForm(f => ({ ...f, director: e.target.value }))}
                  />
                </div>
                <div className="import-form-group import-form-group-full">
                  <label>Cast (optional)</label>
                  <input
                    className="import-input"
                    placeholder="e.g. Prabhas, Deepika Padukone"
                    value={importForm.cast}
                    onChange={e => setImportForm(f => ({ ...f, cast: e.target.value }))}
                  />
                </div>
              </div>

              {importMsg && (
                <div className={`import-msg ${importMsg.type}`}>
                  {importMsg.type === 'success' ? '✅' : '❌'} {importMsg.text}
                </div>
              )}
            </div>

            <div className="import-dialog-footer">
              <button className="btn-cancel-import" onClick={() => setImportTarget(null)}>Cancel</button>
              <button
                className="btn-confirm-import"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? '⏳ Importing…' : '⬇ Import Movie'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT DIALOG ── */}
      {editMovie && (
        <div className="modal-overlay" onClick={() => setEditMovie(null)}>
          <div className="edit-dialog" onClick={e => e.stopPropagation()}>
            <div className="import-dialog-header">
              <h3 className="import-dialog-title">✏️ Edit Movie: {editMovie.title}</h3>
              <button className="modal-close-btn" onClick={() => setEditMovie(null)}>✕</button>
            </div>
            <div className="edit-dialog-body">
              <div className="edit-form-grid">
                {[
                  { key: 'title', label: 'Title', type: 'text' },
                  { key: 'genre', label: 'Genre', type: 'text' },
                  { key: 'director', label: 'Director', type: 'text' },
                  { key: 'durationMinutes', label: 'Duration (min)', type: 'number' },
                  { key: 'releaseDate', label: 'Release Date', type: 'date' },
                  { key: 'rating', label: 'Rating (0-10)', type: 'number' },
                  { key: 'trailerUrl', label: 'Trailer URL', type: 'text' },
                ].map(f => (
                  <div key={f.key} className="edit-form-group">
                    <label>{f.label}</label>
                    <input
                      className="edit-input"
                      type={f.type}
                      value={editForm[f.key] || ''}
                      onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}

                {/* Poster URL with Live Validation & Preview */}
                <PosterUrlField
                  id="edit-poster-url-input"
                  value={editForm.posterUrl || ''}
                  onChange={url => setEditForm(prev => ({ ...prev, posterUrl: url }))}
                  movieTitle={editForm.title || editMovie?.title || 'Movie Title'}
                  required={true}
                />
                <div className="edit-form-group">
                  <label>Language</label>
                  <select className="edit-select" value={editForm.language} onChange={e => setEditForm(p => ({ ...p, language: e.target.value }))}>
                    {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="edit-form-group">
                  <label>Status</label>
                  <select className="edit-select" value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="edit-form-group">
                  <label>Certification</label>
                  <select className="edit-select" value={editForm.certification} onChange={e => setEditForm(p => ({ ...p, certification: e.target.value }))}>
                    {CERT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="edit-form-group edit-form-group-full">
                  <label>Cast</label>
                  <input className="edit-input" value={editForm.cast || ''} onChange={e => setEditForm(p => ({ ...p, cast: e.target.value }))} />
                </div>
                <div className="edit-form-group edit-form-group-full">
                  <label>Description</label>
                  <textarea
                    className="edit-textarea"
                    rows={3}
                    value={editForm.description || ''}
                    onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="import-dialog-footer">
              <button className="btn-cancel-import" onClick={() => setEditMovie(null)}>Cancel</button>
              <button className="btn-confirm-import" onClick={handleSaveEdit} disabled={saving}>
                {saving ? '⏳ Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MOVIE DIALOG ── */}
      {showAddMovie && (
        <div className="modal-overlay" onClick={() => setShowAddMovie(false)}>
          <div className="edit-dialog" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="import-dialog-header">
              <h3 className="import-dialog-title">➕ Add Movie to Local Database</h3>
              <button className="modal-close-btn" onClick={() => setShowAddMovie(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateMovie}>
              <div className="edit-dialog-body">
                <div className="edit-form-grid">
                  <div className="edit-form-group">
                    <label>Title *</label>
                    <input
                      className="edit-input"
                      type="text"
                      required
                      placeholder="e.g. Jailer 2"
                      value={addForm.title}
                      onChange={e => setAddForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label>Genre</label>
                    <input
                      className="edit-input"
                      type="text"
                      placeholder="e.g. Action, Thriller"
                      value={addForm.genre}
                      onChange={e => setAddForm(prev => ({ ...prev, genre: e.target.value }))}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label>Director</label>
                    <input
                      className="edit-input"
                      type="text"
                      placeholder="e.g. Nelson Dilipkumar"
                      value={addForm.director}
                      onChange={e => setAddForm(prev => ({ ...prev, director: e.target.value }))}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label>Duration (mins)</label>
                    <input
                      className="edit-input"
                      type="number"
                      value={addForm.durationMinutes}
                      onChange={e => setAddForm(prev => ({ ...prev, durationMinutes: parseInt(e.target.value, 10) || 120 }))}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label>Release Date</label>
                    <input
                      className="edit-input"
                      type="date"
                      value={addForm.releaseDate}
                      onChange={e => setAddForm(prev => ({ ...prev, releaseDate: e.target.value }))}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label>Rating (0-10)</label>
                    <input
                      className="edit-input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={addForm.rating}
                      onChange={e => setAddForm(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label>YouTube Trailer URL</label>
                    <input
                      className="edit-input"
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={addForm.trailerUrl}
                      onChange={e => setAddForm(prev => ({ ...prev, trailerUrl: e.target.value }))}
                    />
                  </div>

                  {/* Poster URL with Live Validation & Preview */}
                  <PosterUrlField
                    id="add-poster-url-input"
                    value={addForm.posterUrl}
                    onChange={url => setAddForm(prev => ({ ...prev, posterUrl: url }))}
                    movieTitle={addForm.title}
                    required={true}
                  />

                  <div className="edit-form-group">
                    <label>Language</label>
                    <select
                      className="edit-select"
                      value={addForm.language}
                      onChange={e => setAddForm(p => ({ ...p, language: e.target.value }))}
                    >
                      {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="edit-form-group">
                    <label>Status</label>
                    <select
                      className="edit-select"
                      value={addForm.status}
                      onChange={e => setAddForm(p => ({ ...p, status: e.target.value }))}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="edit-form-group">
                    <label>Certification</label>
                    <select
                      className="edit-select"
                      value={addForm.certification}
                      onChange={e => setAddForm(p => ({ ...p, certification: e.target.value }))}
                    >
                      {CERT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="edit-form-group edit-form-group-full">
                    <label>Cast</label>
                    <input
                      className="edit-input"
                      placeholder="e.g. Rajinikanth, Mohanlal, Shiva Rajkumar"
                      value={addForm.cast}
                      onChange={e => setAddForm(p => ({ ...p, cast: e.target.value }))}
                    />
                  </div>
                  <div className="edit-form-group edit-form-group-full">
                    <label>Description</label>
                    <textarea
                      className="edit-textarea"
                      rows={3}
                      placeholder="Movie synopsis..."
                      value={addForm.description}
                      onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                </div>

                {addMsg && (
                  <div className={`import-msg ${addMsg.type}`} style={{ marginTop: '16px' }}>
                    {addMsg.type === 'success' ? '✅' : '❌'} {addMsg.text}
                  </div>
                )}
              </div>
              <div className="import-dialog-footer">
                <button type="button" className="btn-cancel-import" onClick={() => setShowAddMovie(false)}>Cancel</button>
                <button type="submit" className="btn-confirm-import" disabled={addingMovie}>
                  {addingMovie ? '⏳ Adding Movie…' : '➕ Add Movie to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── THEATER & SHOWTIME ASSOCIATION MODAL ── */}
      {showModalMovie && (
        <div className="modal-overlay" onClick={() => setShowModalMovie(null)}>
          <div className="import-dialog" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
            <div className="import-dialog-header">
              <div className="import-dialog-title-wrap">
                <img
                  src={showModalMovie.posterUrl}
                  alt={showModalMovie.title}
                  className="import-dialog-poster"
                />
                <div>
                  <h3 className="import-dialog-title">🗓️ Link Theaters &amp; Shows: {showModalMovie.title}</h3>
                  <p className="import-dialog-sub">
                    {showModalMovie.language} · {showModalMovie.durationMinutes} mins · {showModalMovie.genre}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModalMovie(null)}>✕</button>
            </div>

            <div className="import-dialog-body">
              {/* Form to Schedule a New Show */}
              <h4 style={{ color: 'var(--primary-dark)', marginBottom: '14px', fontSize: '1rem', fontWeight: 800 }}>
                ➕ Schedule New Show for this Movie
              </h4>
              <form onSubmit={handleCreateShow} className="import-form-grid" style={{ marginBottom: '24px' }}>
                <div className="import-form-group">
                  <label>Select Theater</label>
                  <select
                    className="import-select"
                    value={selectedTheaterId}
                    onChange={e => handleTheaterChange(e.target.value)}
                  >
                    {theaters.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.city || 'Hyderabad'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="import-form-group">
                  <label>Select Screen</label>
                  <select
                    className="import-select"
                    value={showForm.screenId}
                    onChange={e => setShowForm(p => ({ ...p, screenId: e.target.value }))}
                  >
                    {screens.length === 0 && <option value="">No screens in this theater</option>}
                    {screens.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.screenType} - {s.totalSeats} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="import-form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    className="import-input"
                    value={showForm.showDate}
                    onChange={e => setShowForm(p => ({ ...p, showDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="import-form-group">
                  <label>Show Time</label>
                  <input
                    type="time"
                    className="import-input"
                    value={showForm.showTime}
                    onChange={e => setShowForm(p => ({ ...p, showTime: e.target.value }))}
                    required
                  />
                </div>

                <div className="import-form-group">
                  <label>Regular Seat (₹)</label>
                  <input
                    type="number"
                    className="import-input"
                    value={showForm.priceRegular}
                    onChange={e => setShowForm(p => ({ ...p, priceRegular: e.target.value }))}
                    required
                  />
                </div>

                <div className="import-form-group">
                  <label>Premium Seat (₹)</label>
                  <input
                    type="number"
                    className="import-input"
                    value={showForm.pricePremium}
                    onChange={e => setShowForm(p => ({ ...p, pricePremium: e.target.value }))}
                    required
                  />
                </div>

                <div className="import-form-group">
                  <label>VIP Seat (₹)</label>
                  <input
                    type="number"
                    className="import-input"
                    value={showForm.priceVip}
                    onChange={e => setShowForm(p => ({ ...p, priceVip: e.target.value }))}
                    required
                  />
                </div>

                <div className="import-form-group">
                  <label>Recliner Seat (₹)</label>
                  <input
                    type="number"
                    className="import-input"
                    value={showForm.priceRecliner}
                    onChange={e => setShowForm(p => ({ ...p, priceRecliner: e.target.value }))}
                    required
                  />
                </div>

                <div className="import-form-group-full" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="submit"
                    className="btn-confirm-import"
                    disabled={creatingShow || screens.length === 0}
                  >
                    {creatingShow ? '⏳ Scheduling…' : '🎟️ Schedule & Link Showtime'}
                  </button>
                </div>
              </form>

              {showMsg && (
                <div className={`import-msg ${showMsg.type}`} style={{ marginBottom: '20px' }}>
                  {showMsg.type === 'success' ? '✅' : '❌'} {showMsg.text}
                </div>
              )}

              {/* Existing Shows List */}
              <div style={{ borderTop: '1.5px solid var(--border-color)', paddingTop: '18px' }}>
                <h4 style={{ color: 'var(--primary-dark)', marginBottom: '12px', fontSize: '1rem', fontWeight: 800 }}>
                  Current Scheduled Shows ({existingShows.length})
                </h4>
                {showsLoading ? (
                  <p className="text-muted">Loading shows…</p>
                ) : existingShows.length === 0 ? (
                  <p className="text-muted" style={{ fontStyle: 'italic' }}>
                    No shows currently scheduled for this movie. Add one using the form above!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                    {existingShows.map(sh => (
                      <div
                        key={sh.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'var(--surface-warm)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                        }}
                      >
                        <div>
                          <strong>{sh.screen?.theater?.name || 'Theater'}</strong> — {sh.screen?.name} ({sh.screen?.screenType})
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                            📅 {sh.startTime ? new Date(sh.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                            {' · '}₹{sh.priceRegular || 150} - ₹{sh.priceRecliner || 450}
                            {' · '}<span style={{ fontWeight: 700, color: sh.status === 'SCHEDULED' ? '#15803d' : '#991b1b' }}>{sh.status}</span>
                          </div>
                        </div>
                        {sh.status === 'SCHEDULED' && (
                          <button
                            className="btn-admin-delete"
                            onClick={() => handleCancelShow(sh.id)}
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            title="Cancel Show"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="import-dialog-footer">
              <button className="btn-cancel-import" onClick={() => setShowModalMovie(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;
