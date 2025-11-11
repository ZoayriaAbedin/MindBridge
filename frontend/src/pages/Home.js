import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to MindBridge</h1>
          <p className="tagline">
            Connecting You with Mental Health Professionals
          </p>
          <p className="subtitle">
            Your journey to better mental health starts here. Find therapists, book appointments, 
            and join support communities.
          </p>
          
          {!isAuthenticated ? (
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
            </div>
          ) : (
            <div className="cta-buttons">
              <Link 
                to={user?.role === 'patient' ? '/patient/dashboard' : 
                    user?.role === 'doctor' ? '/doctor/dashboard' : '/admin/dashboard'} 
                className="btn btn-primary"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>How MindBridge Helps You</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Find Therapists</h3>
            <p>Search for mental health professionals by location, specialization, and budget</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Book Appointments</h3>
            <p>Schedule therapy sessions online, in-person, or via video call</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Track History</h3>
            <p>Maintain secure medical records and track your treatment progress</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>Manage Prescriptions</h3>
            <p>View and manage your prescriptions, medications, and therapy plans</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Support Groups</h3>
            <p>Join peer support groups and therapy sessions with others</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your health information is encrypted and completely confidential</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <h3>500+</h3>
          <p>Licensed Therapists</p>
        </div>
        <div className="stat-item">
          <h3>10,000+</h3>
          <p>Patients Helped</p>
        </div>
        <div className="stat-item">
          <h3>50+</h3>
          <p>Support Groups</p>
        </div>
        <div className="stat-item">
          <h3>4.8/5</h3>
          <p>Average Rating</p>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of people taking control of their mental health</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Create Free Account
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;
