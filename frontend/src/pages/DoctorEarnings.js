import React, { useState, useEffect } from 'react';
import { appointmentsAPI, authAPI } from '../services/api';
import './DoctorEarnings.css';

const DoctorEarnings = () => {
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    baseSalary: 0,
    totalBonus: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('month');

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      
      // Fetch appointments and profile in parallel
      const [appointmentsRes, profileRes] = await Promise.all([
        appointmentsAPI.getAll({ role: 'doctor', status: 'completed' }),
        authAPI.getProfile()
      ]);
      
      const completedAppointments = appointmentsRes.data.data || [];
      const profile = profileRes.data.data?.profile || {};
      
      const baseSalary = parseFloat(profile.base_salary) || 0;
      const totalBonus = parseFloat(profile.total_bonus) || 0;
      
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayEarnings = completedAppointments
        .filter(apt => new Date(apt.appointment_date) >= todayStart)
        .reduce((sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0), 0);

      const weekEarnings = completedAppointments
        .filter(apt => new Date(apt.appointment_date) >= weekStart)
        .reduce((sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0), 0);

      const monthEarnings = completedAppointments
        .filter(apt => new Date(apt.appointment_date) >= monthStart)
        .reduce((sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0), 0);

      const appointmentsTotal = completedAppointments
        .reduce((sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0), 0);

      setEarnings({
        today: todayEarnings,
        thisWeek: weekEarnings,
        thisMonth: monthEarnings,
        total: appointmentsTotal + baseSalary + totalBonus,
        baseSalary,
        totalBonus,
      });

      setAppointments(completedAppointments);
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    if (filter === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return appointments.filter(apt => new Date(apt.appointment_date) >= todayStart);
    } else if (filter === 'week') {
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      return appointments.filter(apt => new Date(apt.appointment_date) >= weekStart);
    } else if (filter === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return appointments.filter(apt => new Date(apt.appointment_date) >= monthStart);
    }
    return appointments;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">Loading earnings data...</div>;
  }

  const filteredAppointments = getFilteredAppointments();
  const filteredEarnings = filteredAppointments.reduce(
    (sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0),
    0
  );

  return (
    <div className="doctor-earnings">
      <div className="page-header">
        <h1>Earnings Overview</h1>
        <p>Track your consultation revenue</p>
      </div>

      {/* Earnings Summary */}
      <div className="earnings-summary">
        <div className="summary-card">
          <div className="summary-label">Today</div>
          <div className="summary-amount">৳{earnings.today.toFixed(2)}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">This Week</div>
          <div className="summary-amount">৳{earnings.thisWeek.toFixed(2)}</div>
        </div>

        <div className="summary-card">
          <div className="summary-label">This Month</div>
          <div className="summary-amount">৳{earnings.thisMonth.toFixed(2)}</div>
        </div>

        <div className="summary-card highlight">
          <div className="summary-label">Total Earnings</div>
          <div className="summary-amount">৳{earnings.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Compensation Breakdown */}
      {(earnings.baseSalary > 0 || earnings.totalBonus > 0) && (
        <div className="compensation-breakdown">
          <h2>💰 Compensation Breakdown</h2>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <span className="breakdown-label">Appointments Revenue:</span>
              <span className="breakdown-value">
                ৳{(earnings.total - earnings.baseSalary - earnings.totalBonus).toFixed(2)}
              </span>
            </div>
            {earnings.baseSalary > 0 && (
              <div className="breakdown-item">
                <span className="breakdown-label">Base Salary:</span>
                <span className="breakdown-value salary">
                  ৳{earnings.baseSalary.toFixed(2)}
                </span>
              </div>
            )}
            {earnings.totalBonus > 0 && (
              <div className="breakdown-item">
                <span className="breakdown-label">Total Bonuses:</span>
                <span className="breakdown-value bonus">
                  ৳{earnings.totalBonus.toFixed(2)}
                </span>
              </div>
            )}
            <div className="breakdown-item total">
              <span className="breakdown-label">Total Compensation:</span>
              <span className="breakdown-value">
                ৳{earnings.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="filter-section">
        <h2>Appointment History</h2>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            Today
          </button>
          <button
            className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >
            This Week
          </button>
          <button
            className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >
            This Month
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="earnings-table-container">
        <div className="table-header">
          <h3>Completed Appointments ({filteredAppointments.length})</h3>
          <div className="period-total">
            Total: <strong>৳{filteredEarnings.toFixed(2)}</strong>
          </div>
        </div>

        {filteredAppointments.length > 0 ? (
          <table className="earnings-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient Name</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Fee</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>{formatDate(apt.appointment_date)}</td>
                  <td>{apt.patient_first_name} {apt.patient_last_name}</td>
                  <td>
                    <span className="appointment-type">{apt.appointment_type}</span>
                  </td>
                  <td>{apt.reason || 'General consultation'}</td>
                  <td className="fee-column">৳{parseFloat(apt.consultation_fee || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No completed appointments in this period</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorEarnings;
