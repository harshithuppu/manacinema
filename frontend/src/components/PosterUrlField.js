import React, { useState, useEffect, useRef } from 'react';

/**
 * Reusable Poster URL Input with Live Validation & Cinema Card Preview.
 *
 * Requirements satisfied:
 * 1. Accepts valid direct image URLs (.jpg, .jpeg, .png, .webp, .svg, .avif, etc.).
 * 2. Accepts image URLs that do NOT end with an image extension (TMDB w500, Unsplash, CDN).
 * 3. Does not require a TMDB movie ID.
 * 4. Real-time image validation with clear success and error indicators.
 * 5. Consistent 2:3 cinema poster aspect ratio preview with movie title displayed clearly below.
 */
const PosterUrlField = ({
  value = '',
  onChange,
  movieTitle = 'Movie Title',
  required = false,
  disabled = false,
  id = 'poster-url-input',
}) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'valid' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [imgDimensions, setImgDimensions] = useState(null);
  const activeUrlRef = useRef('');

  // Normalize TMDB relative paths if entered (e.g. /abc.jpg)
  const isTmdbRelative = value && value.trim().startsWith('/') && !value.trim().startsWith('//');

  const handleFixTmdbRelative = () => {
    if (isTmdbRelative) {
      const fixed = `https://image.tmdb.org/t/p/w500${value.trim()}`;
      onChange(fixed);
    }
  };

  useEffect(() => {
    const trimmed = (value || '').trim();
    activeUrlRef.current = trimmed;

    if (!trimmed) {
      setStatus('idle');
      setErrorMsg('');
      setImgDimensions(null);
      return;
    }

    // Basic URL format validation
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      if (trimmed.startsWith('/')) {
        setStatus('error');
        setErrorMsg('Relative TMDB path detected. Click "Format as TMDB URL" or provide a full https:// URL.');
      } else {
        setStatus('error');
        setErrorMsg('URL must start with http:// or https://');
      }
      setImgDimensions(null);
      return;
    }

    // Validate that the image actually loads in the browser
    setStatus('loading');
    setErrorMsg('');

    const testImg = new Image();
    testImg.onload = () => {
      // Avoid race conditions if user changed input while image was downloading
      if (activeUrlRef.current === trimmed) {
        setStatus('valid');
        setErrorMsg('');
        setImgDimensions({
          width: testImg.naturalWidth,
          height: testImg.naturalHeight,
        });
      }
    };

    testImg.onerror = () => {
      if (activeUrlRef.current === trimmed) {
        setStatus('error');
        setErrorMsg(
          'Image failed to load. The URL does not link directly to a loadable image or returned an error (HTTP 404 / access blocked).'
        );
        setImgDimensions(null);
      }
    };

    testImg.src = trimmed;
  }, [value]);

  return (
    <div className="poster-field-container">
      <div className="poster-input-header">
        <label htmlFor={id} className="poster-input-label">
          Poster Image URL {required && <span className="text-red-500">*</span>}
        </label>
        {status === 'valid' && (
          <span className="poster-status-pill status-pill-success">
            ✓ Valid Image Loaded {imgDimensions ? `(${imgDimensions.width}×${imgDimensions.height}px)` : ''}
          </span>
        )}
        {status === 'loading' && (
          <span className="poster-status-pill status-pill-loading">
            ⏳ Testing Image URL…
          </span>
        )}
        {status === 'error' && (
          <span className="poster-status-pill status-pill-error">
            ✕ Image Load Failed
          </span>
        )}
      </div>

      <div className="poster-input-row">
        <div className="poster-input-wrap">
          <input
            id={id}
            type="text"
            className={`poster-url-input ${status === 'valid' ? 'input-valid' : ''} ${status === 'error' ? 'input-error' : ''}`}
            placeholder="e.g. https://image.tmdb.org/t/p/w500/... or direct .jpg/.png/.webp URL"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            autoComplete="off"
          />
          {value && !disabled && (
            <button
              type="button"
              className="poster-input-clear-btn"
              onClick={() => onChange('')}
              title="Clear URL"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick helper for TMDB relative paths */}
      {isTmdbRelative && (
        <div className="poster-fix-helper">
          <span>💡 TMDB shorthand detected:</span>
          <button
            type="button"
            className="btn-fix-tmdb"
            onClick={handleFixTmdbRelative}
          >
            Convert to: https://image.tmdb.org/t/p/w500{value.trim()}
          </button>
        </div>
      )}

      {/* Validation Message Box */}
      {status === 'error' && (
        <div className="poster-validation-alert error-alert">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <strong>Invalid Poster URL:</strong>
            <p>{errorMsg}</p>
            <span className="alert-hint">
              Tips: Use a direct image URL ending in .jpg, .jpeg, .png, or .webp, or a standard TMDB image URL like{' '}
              <code>https://image.tmdb.org/t/p/w500/&#123;poster_path&#125;</code>. Web page links (like Google Drive, social share links) are not direct images.
            </span>
          </div>
        </div>
      )}

      {status === 'valid' && (
        <div className="poster-validation-alert success-alert">
          <div className="alert-icon">✅</div>
          <div className="alert-content">
            <strong>Ready for display:</strong> Image verified and ready to be stored in the MANA CINEMA catalog.
          </div>
        </div>
      )}

      {/* ── LIVE POSTER PREVIEW ── */}
      <div className="poster-preview-section">
        <div className="preview-section-title">
          <span>Live Poster &amp; Title Preview</span>
          <span className="preview-ratio-tag">Standard Cinema Ratio (2:3)</span>
        </div>

        <div className="poster-preview-card-wrap">
          {/* Simulated MANA Cinema Card with title clearly below */}
          <div className="simulated-cinema-card">
            <div className="simulated-poster-box">
              {status === 'valid' ? (
                <img
                  src={value.trim()}
                  alt={movieTitle || 'Poster Preview'}
                  className="simulated-poster-img"
                />
              ) : status === 'loading' ? (
                <div className="simulated-placeholder loading-placeholder">
                  <div className="preview-spinner"></div>
                  <span>Loading preview…</span>
                </div>
              ) : status === 'error' ? (
                <div className="simulated-placeholder error-placeholder">
                  <span className="placeholder-icon">❌</span>
                  <span className="placeholder-text">Image Cannot Be Loaded</span>
                  <span className="placeholder-subtext">Check the URL above</span>
                </div>
              ) : (
                <div className="simulated-placeholder empty-placeholder">
                  <span className="placeholder-icon">🎬</span>
                  <span className="placeholder-text">No Poster Provided</span>
                  <span className="placeholder-subtext">Paste an image URL to preview</span>
                </div>
              )}

              {/* Badges overlay in preview */}
              <div className="simulated-badge-overlay">
                <span className="simulated-badge">MANA PREVIEW</span>
              </div>
            </div>

            {/* Movie Title clearly displayed below the poster */}
            <div className="simulated-info-row">
              <h4 className="simulated-title" title={movieTitle || 'Untitled Movie'}>
                {movieTitle && movieTitle.trim() ? movieTitle : 'Untitled Movie'}
              </h4>
              <span className="simulated-subtitle">Now Showing • 2K Laser</span>
            </div>
          </div>

          <div className="preview-guidance-col">
            <h5>📌 Image Guidelines</h5>
            <ul>
              <li><strong>Direct URLs:</strong> <code>.jpg</code>, <code>.png</code>, <code>.webp</code>, etc.</li>
              <li><strong>TMDB URLs:</strong> <code>https://image.tmdb.org/t/p/w500/...</code> supported directly without needing a TMDB ID.</li>
              <li><strong>Aspect Ratio:</strong> Optimal ratio is <strong>2:3</strong> (e.g. 500×750 or 600×900) for uniform presentation on Home &amp; Movies catalog.</li>
              <li><strong>Persistence:</strong> Changes save directly to the MySQL database and remain after restart.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterUrlField;
