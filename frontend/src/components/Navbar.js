import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'patient') return '/patient/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const getProfileLink = () => {
    if (!user) return '/';
    if (user.role === 'patient') return '/patient/profile';
    if (user.role === 'doctor') return '/doctor/profile';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🧠 MindBridge
        </Link>

        <button 
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link 
                to={getDashboardLink()} 
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              {(user?.role === 'patient' || user?.role === 'doctor') && (
                <Link 
                  to={getProfileLink()} 
                  className="nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
              <div className="nav-user">
                <span className="user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="user-role">{user?.role}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
