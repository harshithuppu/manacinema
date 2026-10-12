import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import OpeningPage from './pages/OpeningPage';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import MyBookingsPage from './pages/MyBookingsPage';
import TheatersPage from './pages/TheatersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminMoviesPage from './pages/AdminMoviesPage';

function App() {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('mana_selected_city') || 'Hyderabad';
  });

  const handleCityChange = (city) => {
    setSelectedCity(city);
    localStorage.setItem('mana_selected_city', city);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar selectedCity={selectedCity} setSelectedCity={handleCityChange} />

          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<OpeningPage selectedCity={selectedCity} setSelectedCity={handleCityChange} />} />
              <Route path="/movies" element={<HomePage selectedCity={selectedCity} />} />
              <Route path="/movie/:id" element={<MovieDetailsPage selectedCity={selectedCity} />} />
              <Route path="/theaters" element={<TheatersPage selectedCity={selectedCity} />} />
              <Route path="/book/:showId" element={<SeatSelectionPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Customer Protected Route */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Theater Owner Protected Route */}
              <Route
                path="/owner-dashboard"
                element={
                  <ProtectedRoute requiredRole="THEATER_OWNER">
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/movies"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminMoviesPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
