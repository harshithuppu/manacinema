import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand-col">
          <div className="footer-logo">
            <span className="brand-icon">🎬</span>
            <span className="brand-name">MANA <span className="text-red">CINEMA</span></span>
          </div>
          <p className="footer-desc">
            Next-generation full-stack movie theater & ticket booking platform built with Java Spring Boot, Spring Security, JWT authentication, MySQL, Hibernate, and React.
          </p>
          <div className="tech-stack-pills">
            <span className="tech-pill">Java 17+</span>
            <span className="tech-pill">Spring Boot 3</span>
            <span className="tech-pill">Spring Security</span>
            <span className="tech-pill">JWT</span>
            <span className="tech-pill">MySQL</span>
            <span className="tech-pill">Hibernate JPA</span>
            <span className="tech-pill">React.js</span>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Quick Navigation</h4>
          <ul>
            <li><Link to="/">Home &amp; Experiences</Link></li>
            <li><Link to="/movies">Now Showing Movies</Link></li>
            <li><Link to="/movies">Coming Soon Blockbusters</Link></li>
            <li><Link to="/theaters">Participating Theaters</Link></li>
            <li><Link to="/my-bookings">My E-Tickets</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Portal Access</h4>
          <ul>
            <li><Link to="/login">Customer Login</Link></li>
            <li><Link to="/owner-dashboard">Theater Owner Portal</Link></li>
            <li><Link to="/admin-dashboard">Admin Master Console</Link></li>
            <li><Link to="/register">Create Account</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Cinema Experiences</h4>
          <ul>
            <li><span className="text-muted">IMAX Laser & 3D</span></li>
            <li><span className="text-muted">Dolby Atmos Audio</span></li>
            <li><span className="text-muted">4DX Dynamic Motion</span></li>
            <li><span className="text-muted">VIP Luxury Recliners</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>© {new Date().getFullYear()} MANA CINEMA Ticket Booking System. All rights reserved.</p>
          <div className="role-indicators">
            <span className="role-tag">👤 Customer</span>
            <span className="role-tag">🎬 Theater Owner</span>
            <span className="role-tag">🔑 Admin</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
