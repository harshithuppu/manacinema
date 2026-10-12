import React from 'react';

const TicketModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const show = booking.show || {};
  const movie = show.movie || {};
  const screen = show.screen || {};
  const theater = screen.theater || {};
  const bookedSeats = booking.bookedSeats || [];

  const seatNames = bookedSeats.map(s => {
    const seat = s.seat || {};
    return `${seat.rowName || ''}${seat.seatNumber || ''}`;
  }).filter(Boolean).join(', ');

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="ticket-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        {/* Physical Movie Ticket Style Card */}
        <div className="physical-ticket">
          {/* Ticket Header */}
          <div className="ticket-header">
            <div className="ticket-brand">
              <span className="brand-icon">🎬</span>
              <span className="brand-text">MANA CINEMA TICKET</span>
            </div>
            <div className={`ticket-status-pill status-${booking.bookingStatus?.toLowerCase()}`}>
              {booking.bookingStatus || 'CONFIRMED'}
            </div>
          </div>

          {/* Ticket Body */}
          <div className="ticket-body">
            <div className="ticket-poster-wrap">
              <img
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400'}
                alt={movie.title}
                className="ticket-poster"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400';
                }}
              />
            </div>
            <div className="ticket-details">
              <h2 className="ticket-movie-title">{movie.title || 'Movie Title'}</h2>
              <div className="ticket-movie-meta">
                <span className="meta-badge">{movie.certification || 'UA'}</span>
                <span className="meta-badge">{movie.language || 'English'}</span>
                <span className="meta-badge">{screen.screenType || 'IMAX'}</span>
              </div>

              <div className="ticket-grid">
                <div className="ticket-item">
                  <span className="ticket-label">THEATER</span>
                  <span className="ticket-value">{theater.name || 'Cinema Cineplex'}</span>
                  <span className="ticket-subvalue">{theater.city || ''}</span>
                </div>
                <div className="ticket-item">
                  <span className="ticket-label">SCREEN</span>
                  <span className="ticket-value">{screen.name || 'Screen 1'}</span>
                </div>
                <div className="ticket-item">
                  <span className="ticket-label">DATE & TIME</span>
                  <span className="ticket-value highlight-gold">{formatDateTime(show.startTime)}</span>
                </div>
                <div className="ticket-item">
                  <span className="ticket-label">SEATS ({bookedSeats.length})</span>
                  <span className="ticket-value highlight-red">{seatNames || 'Seats Reserved'}</span>
                </div>
                <div className="ticket-item">
                  <span className="ticket-label">BOOKING ID</span>
                  <span className="ticket-value font-mono">{booking.bookingNumber || 'CNV-XXXX'}</span>
                </div>
                <div className="ticket-item">
                  <span className="ticket-label">TOTAL PAID</span>
                  <span className="ticket-value font-bold text-green">${booking.finalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="ticket-perforation">
            <div className="cutout cutout-left"></div>
            <div className="dashed-line"></div>
            <div className="cutout cutout-right"></div>
          </div>

          {/* Ticket Stub / Barcode Footer */}
          <div className="ticket-footer">
            <div className="ticket-qr-section">
              <div className="qr-simulated">
                {/* Simulated QR Code Canvas/Grid */}
                <div className="qr-matrix">
                  <div className="qr-corner top-left"></div>
                  <div className="qr-corner top-right"></div>
                  <div className="qr-corner bottom-left"></div>
                  <div className="qr-pixel-grid"></div>
                </div>
              </div>
              <div className="ticket-entry-instructions">
                <span>Scan this QR code at cinema entrance</span>
                <span className="font-mono text-muted">{booking.paymentTransactionId || 'TXN-9823419082'}</span>
              </div>
            </div>

            <div className="ticket-actions no-print">
              <button className="btn-secondary" onClick={handlePrint}>
                🖨️ Print / Save Ticket
              </button>
              <button className="btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
