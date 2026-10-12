import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const isComingSoon = movie.status === 'COMING_SOON';

  return (
    <div className="movie-card group">
      <div className="movie-poster-wrap">
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500'}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500';
          }}
        />

        {/* Status Badge */}
        <div className="movie-badges-top">
          {isComingSoon ? (
            <span className="badge-coming-soon">COMING SOON</span>
          ) : (
            <span className="badge-now-showing">NOW SHOWING</span>
          )}
          {movie.rating != null && (
            <span className="badge-rating">
              ★ {movie.rating <= 5 ? (movie.rating * 2).toFixed(1) : Number(movie.rating).toFixed(1)}
            </span>
          )}
        </div>

        {/* Hover overlay with details */}
        <div className="movie-hover-overlay">
          <div className="overlay-content">
            <h4 className="overlay-title">{movie.title}</h4>
            <p className="overlay-genres">{movie.genre}</p>
            <p className="overlay-desc">{movie.description ? movie.description.substring(0, 95) + '...' : ''}</p>

            <div className="overlay-actions">
              <Link to={`/movie/${movie.id}`} className="btn-book-now">
                {isComingSoon ? 'View Details' : 'Book Tickets 🎟️'}
              </Link>
              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-trailer"
                >
                  ▶ Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={movie.title}>
          <Link to={`/movie/${movie.id}`}>{movie.title}</Link>
        </h3>
        <div className="movie-meta-row">
          <span className="movie-genre-text">{movie.genre?.split(',')[0]}</span>
          <span className="movie-duration-pill">{movie.durationMinutes || 120} min</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
