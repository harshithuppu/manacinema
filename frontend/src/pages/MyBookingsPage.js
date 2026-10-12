import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../api/api';
import TicketModal from '../components/TicketModal';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getMyBookings(0, 50);
      setBookings(res.data?.content || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A refund will be initiated.')) {
      return;
    }

    setCancellingId(id);
    try {
      await bookingAPI.cancel(id);
      alert('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="my-bookings-page">
      <div className="section-container py-10">
        <div className="page-header-row mb-8">
          <div>
            <h1 className="page-main-title">My Movie Bookings</h1>
            <p className="text-muted">Manage your tickets, view barcodes, or initiate cancellations</p>
          </div>
          <Link to="/" className="btn-primary">
            + Book Another Movie
          </Link>
        </div>

        {loading ? (
          <div className="loading-state py-20">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-muted">Retrieving your ticket reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-bookings-card">
            <div className="empty-icon">🎟️</div>
            <h3>No Bookings Yet</h3>
            <p>You haven't reserved any movie tickets yet. Explore current blockbusters in theaters!</p>
            <Link to="/" className="btn-primary mt-4 inline-block">
              Explore Now Showing Movies
            </Link>
          </div>
        ) : (
          <div className="bookings-cards-grid">
            {bookings.map(booking => {
              const show = booking.show || {};
              const movie = show.movie || {};
              const screen = show.screen || {};
              const theater = screen.theater || {};
              const seats = booking.bookedSeats || [];
              const seatNames = seats.map(s => `${s.seat?.rowName || ''}${s.seat?.seatNumber || ''}`).join(', ');
              const isConfirmed = booking.bookingStatus === 'CONFIRMED';

              return (
                <div key={booking.id} className="booking-ticket-card">
                  <div className="booking-card-top">
                    <img
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300'}
                      alt={movie.title}
                      className="booking-movie-thumb"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300';
                      }}
                    />
                    <div className="booking-card-details">
                      <div className="booking-header-line">
                        <span className="booking-code font-mono">#{booking.bookingNumber}</span>
                        <span className={`booking-status-tag status-${booking.bookingStatus?.toLowerCase()}`}>
                          {booking.bookingStatus}
                        </span>
                      </div>
                      <h3 className="booking-movie-title">{movie.title || 'Movie'}</h3>
                      <p className="booking-theater-line">
                        📍 <strong>{theater.name}</strong> • {theater.city}
                      </p>
                      <p className="booking-screen-line">
                        {screen.name} ({screen.screenType})
                      </p>
                      <p className="booking-time-line highlight-gold">
                        🕒 {formatDateTime(show.startTime)}
                      </p>
                      <div className="booking-seats-line">
                        <span>Seats ({seats.length}):</span>
                        <strong className="text-white ml-1">{seatNames || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="booking-card-footer">
                    <div className="booking-amount-wrap">
                      <span className="amount-label">Amount Paid</span>
                      <span className="amount-val">${booking.finalAmount?.toFixed(2)}</span>
                    </div>

                    <div className="booking-card-actions">
                      <button
                        className="btn-view-ticket"
                        onClick={() => setSelectedTicket(booking)}
                      >
                        🎟️ View E-Ticket
                      </button>

                      {isConfirmed && (
                        <button
                          className="btn-cancel-ticket"
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Modal popup */}
      {selectedTicket && (
        <TicketModal
          booking={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;
