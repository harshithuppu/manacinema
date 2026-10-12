import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      // Direct user based on role or original redirect
      const roles = result.data?.roles || [];
      if (roles.includes('ROLE_ADMIN')) {
        navigate('/admin-dashboard');
      } else if (roles.includes('ROLE_THEATER_OWNER')) {
        navigate('/owner-dashboard');
      } else {
        navigate(redirectPath);
      }
    } else {
      setErrorMsg(result.error);
    }
  };

  // Quick 1-click test credentials
  const handleQuickLogin = async (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setErrorMsg(null);

    const result = await login(user, pass);
    setLoading(false);

    if (result.success) {
      const roles = result.data?.roles || [];
      if (roles.includes('ROLE_ADMIN')) {
        navigate('/admin-dashboard');
      } else if (roles.includes('ROLE_THEATER_OWNER')) {
        navigate('/owner-dashboard');
      } else {
        navigate(redirectPath);
      }
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-card-header">
          <div className="auth-icon-circle">🎬</div>
          <h2>Welcome Back</h2>
          <p className="text-muted">Sign in to your MANA CINEMA movie booking account</p>
        </div>

        {/* 1-Click Quick Demo Login Switcher */}
        <div className="quick-demo-accounts">
          <span className="demo-label">⚡ 1-Click Quick Demo Login:</span>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn-demo-badge admin-badge"
              onClick={() => handleQuickLogin('admin', 'admin123')}
            >
              🔑 Admin
            </button>
            <button
              type="button"
              className="btn-demo-badge owner-badge"
              onClick={() => handleQuickLogin('owner', 'owner123')}
            >
              🎬 Theater Owner
            </button>
            <button
              type="button"
              className="btn-demo-badge customer-badge"
              onClick={() => handleQuickLogin('customer', 'customer123')}
            >
              👤 Customer
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username or Email</label>
            <input
              type="text"
              placeholder="e.g. admin or customer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex-center">
                <span className="spinner-sm mr-2"></span> Authenticating...
              </span>
            ) : (
              'Sign In to Account →'
            )}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-switch-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
