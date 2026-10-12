import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'customer', // 'customer' or 'theater_owner'
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      roles: [formData.role],
    };

    const result = await register(payload);
    setLoading(false);

    if (result.success) {
      alert('Registration successful! Please log in with your credentials.');
      navigate('/login');
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-card-wide">
        <div className="auth-card-header">
          <div className="auth-icon-circle">🎟️</div>
          <h2>Create MANA CINEMA Account</h2>
          <p className="text-muted">Book tickets, reserve luxury seats, or register your cinema theaters</p>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role selector */}
          <div className="role-selector-group">
            <label className="block mb-2 font-semibold">I want to register as:</label>
            <div className="role-radio-cards">
              <label className={`role-card ${formData.role === 'customer' ? 'role-card-active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={formData.role === 'customer'}
                  onChange={handleChange}
                />
                <div className="role-card-content">
                  <span className="role-icon">👤</span>
                  <div>
                    <strong>Movie Customer</strong>
                    <p className="text-xs text-muted">Browse movies, select seats & book tickets</p>
                  </div>
                </div>
              </label>

              <label className={`role-card ${formData.role === 'theater_owner' ? 'role-card-active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="theater_owner"
                  checked={formData.role === 'theater_owner'}
                  onChange={handleChange}
                />
                <div className="role-card-content">
                  <span className="role-icon">🎬</span>
                  <div>
                    <strong>Theater Owner</strong>
                    <p className="text-xs text-muted">Manage auditoriums, screens & movie schedules</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="johndoe123"
                value={formData.username}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="+1 555-0192"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="auth-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex-center">
                <span className="spinner-sm mr-2"></span> Creating Account...
              </span>
            ) : (
              'Complete Registration →'
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-switch-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
