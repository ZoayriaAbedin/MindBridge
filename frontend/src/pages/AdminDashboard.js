import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, doctorsAPI, appointmentsAPI } from '../services/api';
import './AdminDashboard.css';
import './AdminCommon.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    pendingApprovals: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, doctorsRes, appointmentsRes] = await Promise.all([
        usersAPI.getAll().catch(() => ({ data: { data: [] } })),
        doctorsAPI.search({}).catch(() => ({ data: { data: [] } })),
        appointmentsAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      const users = usersRes.data.data || [];
      const doctors = doctorsRes.data.data || [];
      const appointments = appointmentsRes.data.data || [];

      const patients = users.filter(u => u.role === 'patient');
      const pendingDoctors = doctors.filter(d => !d.is_approved);
      const completedAppts = appointments.filter(a => a.status === 'completed');
      const revenue = completedAppts.reduce((sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0), 0);

      setStats({
        totalUsers: users.length,
        totalDoctors: doctors.length,
        totalPatients: patients.length,
        pendingApprovals: pendingDoctors.length,
        totalAppointments: appointments.length,
        completedAppointments: completedAppts.length,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard 👨‍💼</h1>
        <p>Manage your MindBridge platform</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-info">
            <h3>{stats.totalDoctors}</h3>
            <p>Doctors</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤒</div>
          <div className="stat-info">
            <h3>{stats.totalPatients}</h3>
            <p>Patients</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.totalAppointments}</h3>
            <p>Total Appointments</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.completedAppointments}</h3>
            <p>Completed Sessions</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>${stats.totalRevenue.toFixed(2)}</h3>
            <p>Platform Revenue</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.totalDoctors > 0 ? (stats.completedAppointments / stats.totalDoctors).toFixed(1) : 0}</h3>
            <p>Avg Sessions/Doctor</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-grid">
        <div className="dashboard-card quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/admin/users" className="action-btn">
              <span className="icon">👥</span>
              <span>Manage Users</span>
            </Link>
            <Link to="/admin/doctors" className="action-btn">
              <span className="icon">👨‍⚕️</span>
              <span>Manage Doctors</span>
            </Link>
            <Link to="/admin/appointments" className="action-btn">
              <span className="icon">📅</span>
              <span>Manage Appointments</span>
            </Link>
            <Link to="/admin/salary" className="action-btn">
              <span className="icon">💵</span>
              <span>Salary & Bonuses</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-card">
          <h2>Platform Overview</h2>
          <div className="overview-stats">
            <div className="overview-item">
              <span className="overview-label">Active Doctors:</span>
              <span className="overview-value">{stats.totalDoctors - stats.pendingApprovals}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Success Rate:</span>
              <span className="overview-value">
                {stats.totalAppointments > 0 
                  ? `${((stats.completedAppointments / stats.totalAppointments) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Avg Revenue/Session:</span>
              <span className="overview-value">
                ${stats.completedAppointments > 0 
                  ? (stats.totalRevenue / stats.completedAppointments).toFixed(2)
                  : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
