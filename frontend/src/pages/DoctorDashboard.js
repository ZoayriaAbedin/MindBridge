import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI } from '../services/api';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedThisMonth: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll({ role: 'doctor' });
      const allAppointments = response.data.data || [];
      
      setAppointments(allAppointments.slice(0, 5));
      
      // Calculate stats
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();
      
      const todayCount = allAppointments.filter(
        apt => new Date(apt.appointment_date).toDateString() === today
      ).length;
      
      const upcomingCount = allAppointments.filter(
        apt => apt.status === 'scheduled' && new Date(apt.appointment_date) > new Date()
      ).length;
      
      const completedCount = allAppointments.filter(
        apt => apt.status === 'completed' && new Date(apt.appointment_date).getMonth() === thisMonth
      ).length;
      
      const earnings = allAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0), 0);
      
      setStats({
        todayAppointments: todayCount,
        upcomingAppointments: upcomingCount,
        completedThisMonth: completedCount,
        totalEarnings: earnings,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, Dr. {user?.firstName}! 👨‍⚕️</h1>
        <p>Here's your practice overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.todayAppointments}</h3>
            <p>Today's Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔜</div>
          <div className="stat-info">
            <h3>{stats.upcomingAppointments}</h3>
            <p>Upcoming Appointments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.completedThisMonth}</h3>
            <p>Completed This Month</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>${stats.totalEarnings.toFixed(2)}</h3>
            <p>Total Earnings</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/doctor/appointments" className="action-btn">
              <span className="icon">📋</span>
              <span>View All Appointments</span>
            </Link>
            <Link to="/doctor/patients" className="action-btn">
              <span className="icon">🩺</span>
              <span>Patient Records</span>
            </Link>
            <Link to="/doctor/profile" className="action-btn">
              <span className="icon">👤</span>
              <span>Edit Profile</span>
            </Link>
            <Link to="/doctor/schedule" className="action-btn">
              <span className="icon">🕐</span>
              <span>Set Availability</span>
            </Link>
            <Link to="/doctor/earnings" className="action-btn">
              <span className="icon">💵</span>
              <span>View Earnings</span>
            </Link>
            <Link to="/games" className="action-btn">
              <span className="icon">🎮</span>
              <span>Mindful Games</span>
            </Link>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/doctor/appointments">View All</Link>
          </div>
          {appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments.map((apt) => (
                <div key={apt.id} className="appointment-item">
                  <div className="apt-date">
                    {new Date(apt.appointment_date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="apt-info">
                    <strong>{apt.patient_first_name} {apt.patient_last_name}</strong>
                    <p>{apt.reason || 'Regular checkup'}</p>
                    <span className={`status status-${apt.status}`}>{apt.status}</span>
                  </div>
                  <Link to="/doctor/appointments" className="btn btn-sm">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No upcoming appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
