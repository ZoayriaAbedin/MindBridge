import React, { useState, useEffect } from 'react';
import { doctorsAPI, appointmentsAPI, usersAPI } from '../services/api';
import './AdminSalary.css';
import './AdminCommon.css';

const AdminSalary = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');
  const [salaryAdjustment, setSalaryAdjustment] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, appointmentsRes] = await Promise.all([
        doctorsAPI.search({}),
        appointmentsAPI.getAll({ status: 'completed' }),
      ]);

      const doctorsData = doctorsRes.data.data || [];
      const appointmentsData = appointmentsRes.data.data || [];

      // Calculate earnings for each doctor
      const doctorsWithEarnings = doctorsData.map(doctor => {
        const doctorAppointments = appointmentsData.filter(
          apt => apt.doctor_id === doctor.id
        );
        const totalEarnings = doctorAppointments.reduce(
          (sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0),
          0
        );
        const sessionCount = doctorAppointments.length;

        return {
          ...doctor,
          totalEarnings,
          sessionCount,
          bonus: parseFloat(doctor.total_bonus) || 0,
          base_salary: parseFloat(doctor.base_salary) || 0,
        };
      });

      setDoctors(doctorsWithEarnings);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveBonus = (doctor) => {
    setSelectedDoctor(doctor);
    setBonusAmount('');
    setBonusReason('');
    setShowBonusModal(true);
  };

  const handleSaveBonus = async () => {
    if (!bonusAmount || parseFloat(bonusAmount) <= 0) {
      alert('Please enter a valid bonus amount');
      return;
    }

    try {
      // Save bonus to database
      await usersAPI.giveBonus(selectedDoctor.id, parseFloat(bonusAmount), bonusReason);
      
      // Reload data to get updated values
      await loadData();
      
      setShowBonusModal(false);
      alert(`Bonus of $${bonusAmount} given to Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`);
    } catch (error) {
      console.error('Error giving bonus:', error);
      alert(error.response?.data?.message || 'Failed to give bonus');
    }
  };

  const handleAdjustSalary = async (doctor) => {
    const currentSalary = doctor.base_salary || 0;
    const newSalary = prompt(`Enter base salary for Dr. ${doctor.first_name} ${doctor.last_name}:`, currentSalary);
    if (!newSalary || newSalary === currentSalary.toString()) return;

    const parsedSalary = parseFloat(newSalary);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      alert('Please enter a valid salary amount');
      return;
    }

    try {
      // Save salary to database
      await usersAPI.updateSalary(doctor.id, parsedSalary);
      
      // Reload data to get updated values
      await loadData();
      
      alert(`Base salary updated to $${parsedSalary} for Dr. ${doctor.first_name} ${doctor.last_name}`);
    } catch (error) {
      console.error('Error adjusting salary:', error);
      alert(error.response?.data?.message || 'Failed to adjust salary');
    }
  };

  const getTotalPlatformRevenue = () => {
    return appointments.reduce((sum, apt) => sum + (parseFloat(apt.consultation_fee) || 0), 0);
  };

  const getTotalDoctorEarnings = () => {
    return doctors.reduce((sum, d) => sum + d.totalEarnings + (d.base_salary || 0) + (d.bonus || 0), 0);
  };

  const getTotalBonuses = () => {
    return doctors.reduce((sum, d) => sum + (d.bonus || 0), 0);
  };

  if (loading) {
    return <div className="loading">Loading salary data...</div>;
  }

  return (
    <div className="admin-salary">
      <div className="page-header">
        <h1>Salary & Bonus Management</h1>
        <p>Manage doctor compensation and bonuses</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card highlight">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <h3>${getTotalPlatformRevenue().toFixed(2)}</h3>
            <p>Total Platform Revenue</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">💵</div>
          <div className="summary-info">
            <h3>${getTotalDoctorEarnings().toFixed(2)}</h3>
            <p>Total Doctor Earnings</p>
          </div>
        </div>

        <div className="summary-card success">
          <div className="summary-icon">🎁</div>
          <div className="summary-info">
            <h3>${getTotalBonuses().toFixed(2)}</h3>
            <p>Total Bonuses Given</p>
          </div>
        </div>

        <div className="summary-card info">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <h3>{doctors.length > 0 ? (getTotalDoctorEarnings() / doctors.length).toFixed(2) : 0}</h3>
            <p>Avg Earnings per Doctor</p>
          </div>
        </div>
      </div>

      {/* Doctors Salary Table */}
      <div className="salary-table-container">
        <div className="table-header">
          <h2>Doctor Compensation</h2>
        </div>

        <table className="salary-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialization</th>
              <th>Sessions</th>
              <th>Consultation Fee</th>
              <th>Appointments Revenue</th>
              <th>Base Salary</th>
              <th>Bonuses</th>
              <th>Total Compensation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>
                  <div className="doctor-name">
                    Dr. {doctor.first_name} {doctor.last_name}
                  </div>
                </td>
                <td>{doctor.specialization}</td>
                <td className="sessions-count">{doctor.sessionCount}</td>
                <td className="fee-column">${doctor.consultation_fee || 0}</td>
                <td className="earnings-column">${doctor.totalEarnings.toFixed(2)}</td>
                <td className="salary-column">${(doctor.base_salary || 0).toFixed(2)}</td>
                <td className="bonus-column">${(doctor.bonus || 0).toFixed(2)}</td>
                <td className="total-column">
                  <strong>${(doctor.totalEarnings + (doctor.base_salary || 0) + (doctor.bonus || 0)).toFixed(2)}</strong>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleGiveBonus(doctor)}
                      className="btn btn-success btn-sm"
                    >
                      Give Bonus
                    </button>
                    <button
                      onClick={() => handleAdjustSalary(doctor)}
                      className="btn btn-primary btn-sm"
                    >
                      Set Base Salary
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bonus Modal */}
      {showBonusModal && selectedDoctor && (
        <div className="modal-overlay" onClick={() => setShowBonusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Give Bonus to Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
              <button className="close-btn" onClick={() => setShowBonusModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="doctor-stats">
                <div className="stat-item">
                  <span className="stat-label">Current Earnings:</span>
                  <span className="stat-value">${selectedDoctor.totalEarnings.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sessions Completed:</span>
                  <span className="stat-value">{selectedDoctor.sessionCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Previous Bonuses:</span>
                  <span className="stat-value">${(selectedDoctor.bonus || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Bonus Amount ($) *</label>
                <input
                  type="number"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  placeholder="Enter bonus amount"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Reason for Bonus</label>
                <textarea
                  rows="4"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  placeholder="e.g., Excellent patient feedback, High performance, etc."
                />
              </div>

              {bonusAmount && (
                <div className="bonus-preview">
                  <strong>New Total Compensation:</strong>
                  <span className="preview-amount">
                    ${(selectedDoctor.totalEarnings + (selectedDoctor.bonus || 0) + parseFloat(bonusAmount || 0)).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  onClick={() => setShowBonusModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBonus}
                  className="btn btn-primary"
                >
                  Give Bonus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalary;
