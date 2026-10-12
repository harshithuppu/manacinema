import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showAPI, bookingAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import TicketModal from '../components/TicketModal';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [show, setShow] = useState(null);
  const [showSeats, setShowSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchShowAndSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  const fetchShowAndSeats = async () => {
    setLoading(true);
    try {
      const [showRes, seatsRes] = await Promise.all([
        showAPI.getById(showId),
        showAPI.getSeats(showId),
      ]);
      setShow(showRes.data);
      setShowSeats(seatsRes.data || []);
    } catch (err) {
      setErrorMessage('Failed to load show seating layout.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSeatSelection = (showSeat) => {
    if (showSeat.status !== 'AVAILABLE') return;

    const id = showSeat.id;
    if (selectedSeatIds.includes(id)) {
      setSelectedSeatIds(selectedSeatIds.filter(sid => sid !== id));
    } else {
      if (selectedSeatIds.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, id]);
    }
  };

  // Group showSeats by rowName
  const seatsByRow = showSeats.reduce((acc, ss) => {
    const row = ss.seat?.rowName || 'A';
    if (!acc[row]) acc[row] = [];
    acc[row].push(ss);
    return acc;
  }, {});

  // Sort seats within each row by seatNumber
  Object.keys(seatsByRow).forEach(row => {
    seatsByRow[row].sort((a, b) => (a.seat?.seatNumber || 0) - (b.seat?.seatNumber || 0));
  });

  const getSeatPrice = (showSeat) => {
    if (!show) return 15;
    const type = showSeat.seat?.seatType;
    if (type === 'VIP') return show.priceVip || 24.00;
    if (type === 'PREMIUM') return show.pricePremium || 18.00;
    if (type === 'RECLINER') return show.priceRecliner || 28.00;
    return show.priceRegular || 14.00;
  };

  // Calculate pricing
  const selectedSeatsList = showSeats.filter(ss => selectedSeatIds.includes(ss.id));
  const subtotal = selectedSeatsList.reduce((sum, ss) => sum + getSeatPrice(ss), 0);
  const convenienceFee = selectedSeatIds.length * 1.50;
  const totalAmount = subtotal + convenienceFee;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      alert('Please sign in or create an account to complete your ticket booking.');
      navigate('/login', { state: { from: `/book/${showId}` } });
      return;
    }

    if (selectedSeatIds.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    setBookingInProgress(true);
    setErrorMessage(null);
    try {
      const res = await bookingAPI.create({
        showId: Number(showId),
        seatIds: selectedSeatIds,
        paymentMethod: paymentMethod,
      });
      setConfirmedBooking(res.data);
      // Refresh seats
      fetchShowAndSeats();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Booking failed. Some selected seats may have been taken.';
      setErrorMessage(msg);
    } finally {
      setBookingInProgress(false);
    }
  };

  const formatShowTime = (startTimeStr) => {
    try {
      const d = new Date(startTimeStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return startTimeStr;
    }
  };

  if (loading) {
    return (
      <div className="section-container text-center py-24">
        <div className="spinner mx-auto"></div>
        <p className="mt-4 text-muted">Loading cinema hall & seating layout...</p>
      </div>
    );
  }

  const movie = show?.movie || {};
  const screen = show?.screen || {};
  const theater = screen?.theater || {};

  return (
    <div className="seat-selection-page">
      {/* Top Header Bar */}
      <div className="seat-selection-header">
        <div className="section-container header-split">
          <div className="movie-quick-info">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <div>
              <h1 className="header-movie-title">{movie.title || 'Movie'}</h1>
              <p className="header-theater-info">
                📍 {theater.name || 'Theater'} • {screen.name || 'Screen 1'} ({screen.screenType || 'IMAX'}) • ⏱️ {formatShowTime(show?.startTime)}
              </p>
            </div>
          </div>
          <div className="header-timer">
            <span className="timer-icon">⏱️</span>
            <span>Ticket Reservation Active</span>
          </div>
        </div>
      </div>

      <div className="section-container seat-selection-main">
        {/* Left Column: Visual Screen & Seating Layout */}
        <div className="seating-area-card">
          {/* Cinema Screen Curve */}
          <div className="screen-container">
            <div className="screen-curve"></div>
            <div className="screen-glow"></div>
            <span className="screen-label">🎬 ALL EYES THIS WAY • CINEMA SCREEN</span>
          </div>

          {/* Seat Status Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat-sample seat-available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat-sample seat-selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="seat-sample seat-booked"></div>
              <span>Booked</span>
            </div>
            <div className="legend-divider"></div>
            <div className="legend-item">
              <span className="legend-tag tag-vip">VIP (${show?.priceVip || '24'})</span>
            </div>
            <div className="legend-item">
              <span className="legend-tag tag-premium">Premium (${show?.pricePremium || '18'})</span>
            </div>
            <div className="legend-item">
              <span className="legend-tag tag-regular">Regular (${show?.priceRegular || '14'})</span>
            </div>
          </div>

          {/* Interactive Seat Grid */}
          <div className="seats-grid-wrap">
            {Object.keys(seatsByRow).map(rowName => (
              <div key={rowName} className="seat-row">
                <span className="row-label">{rowName}</span>
                <div className="row-seats">
                  {seatsByRow[rowName].map(showSeat => {
                    const isSelected = selectedSeatIds.includes(showSeat.id);
                    const isBooked = showSeat.status === 'BOOKED' || showSeat.status === 'RESERVED';
                    const seatType = showSeat.seat?.seatType?.toLowerCase() || 'regular';

                    return (
                      <button
                        key={showSeat.id}
                        disabled={isBooked}
                        onClick={() => toggleSeatSelection(showSeat)}
                        className={`seat-btn seat-${seatType} ${isSelected ? 'seat-is-selected' : ''} ${isBooked ? 'seat-is-booked' : ''}`}
                        title={`Row ${showSeat.seat?.rowName} Seat ${showSeat.seat?.seatNumber} (${showSeat.seat?.seatType}) - $${getSeatPrice(showSeat).toFixed(2)}`}
                      >
                        <span className="seat-number">{showSeat.seat?.seatNumber}</span>
                      </button>
                    );
                  })}
                </div>
                <span className="row-label">{rowName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Drawer */}
        <div className="booking-summary-sidebar">
          <div className="summary-card">
            <h3 className="summary-title">Booking Summary</h3>

            {/* Movie synopsis card */}
            <div className="summary-movie-info">
              <img
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200'}
                alt={movie.title}
                className="summary-poster"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200';
                }}
              />
              <div className="summary-movie-text">
                <h4>{movie.title}</h4>
                <p className="text-sm text-muted">{movie.genre?.split(',')[0]} • {movie.language}</p>
                <p className="text-sm highlight-red">{screen.screenType} 2D</p>
              </div>
            </div>

            <hr className="summary-divider" />

            {/* Selected Seats Pills */}
            <div className="selected-seats-section">
              <span className="text-muted text-sm">SELECTED SEATS ({selectedSeatIds.length})</span>
              {selectedSeatIds.length === 0 ? (
                <p className="no-seats-prompt">Please select seats from the layout to proceed</p>
              ) : (
                <div className="selected-seats-pills">
                  {selectedSeatsList.map(ss => (
                    <span key={ss.id} className="seat-pill">
                      {ss.seat?.rowName}{ss.seat?.seatNumber}
                      <button
                        className="pill-remove"
                        onClick={() => toggleSeatSelection(ss)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <hr className="summary-divider" />

            {/* Price calculation */}
            <div className="price-breakdown">
              <div className="price-row">
                <span>Tickets Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Convenience Fee</span>
                <span>${convenienceFee.toFixed(2)}</span>
              </div>
              <hr className="price-divider" />
              <div className="price-row total-row">
                <span className="total-label">Total Amount</span>
                <span className="total-value">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method selector */}
            <div className="payment-method-selector">
              <span className="text-muted text-sm mb-2 block">SELECT PAYMENT METHOD</span>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'CREDIT_CARD' ? 'payment-active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>💳 Card (Visa/Mastercard)</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'UPI' ? 'payment-active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>⚡ Instant Pay / UPI</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'NET_BANKING' ? 'payment-active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="NET_BANKING"
                    checked={paymentMethod === 'NET_BANKING'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>🏦 Net Banking</span>
                </label>
              </div>
            </div>

            {errorMessage && (
              <div className="booking-error-banner">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Checkout Action */}
            <button
              className="btn-confirm-checkout"
              disabled={selectedSeatIds.length === 0 || bookingInProgress}
              onClick={handleBooking}
            >
              {bookingInProgress ? (
                <span className="flex-center">
                  <span className="spinner-sm mr-2"></span> Confirming Reservation...
                </span>
              ) : selectedSeatIds.length === 0 ? (
                'Select Seats to Continue'
              ) : (
                `Pay & Confirm $${totalAmount.toFixed(2)} 🎟️`
              )}
            </button>

            {!isAuthenticated && (
              <p className="auth-notice-text">
                💡 You will be prompted to log in or register before finalizing ticket purchase.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Modal popup upon successful booking */}
      {confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => {
            setConfirmedBooking(null);
            navigate('/my-bookings');
          }}
        />
      )}
    </div>
  );
};

export default SeatSelectionPage;
