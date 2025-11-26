import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../services/api';
import './AdminAppointments.css';
import './AdminCommon.css';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await appointmentsAPI.cancel(appointmentId, {
        cancelled_by: 'admin',
        cancellation_reason: 'Cancelled by administrator',
      });
      loadAppointments();
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment({
      id: appointment.id,
      status: appointment.status,
      appointmentDate: new Date(appointment.appointment_date).toISOString().slice(0, 16),
      notes: appointment.notes || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await appointmentsAPI.update(editingAppointment.id, {
        status: editingAppointment.status,
        appointment_date: editingAppointment.appointmentDate,
        notes: editingAppointment.notes,
      });
      setShowEditModal(false);
      loadAppointments();
      alert('Appointment updated successfully');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;

    if (filter !== 'all') {
      filtered = filtered.filter(a => a.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.patient_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.patient_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.doctor_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.doctor_last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      scheduled: 'status-scheduled',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      rescheduled: 'status-rescheduled',
    };
    return statusMap[status] || 'status-default';
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="admin-appointments">
      <div className="page-header">
        <h1>Appointment Management</h1>
        <p>View and manage all appointments</p>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by patient or doctor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({appointments.length})
          </button>
          <button
            className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled ({appointments.filter(a => a.status === 'scheduled').length})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({appointments.filter(a => a.status === 'completed').length})
          </button>
          <button
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({appointments.filter(a => a.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : filteredAppointments.length > 0 ? (
        <div className="appointments-table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Type</th>
                <th>Reason</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>#{apt.id}</td>
                  <td>{formatDateTime(apt.appointment_date)}</td>
                  <td>{apt.patient_first_name} {apt.patient_last_name}</td>
                  <td>Dr. {apt.doctor_first_name} {apt.doctor_last_name}</td>
                  <td>
                    <span className="appointment-type">{apt.appointment_type}</span>
                  </td>
                  <td>{apt.reason || '-'}</td>
                  <td className="fee-column">${apt.consultation_fee || 0}</td>
                  <td>
                    <span className={`status ${getStatusClass(apt.status)}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditAppointment(apt)}
                        className="btn-icon edit"
                        title="Edit"
                      >
                        ✎
                      </button>
                      {apt.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="btn-icon cancel"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No appointments found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAppointment && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Appointment #{editingAppointment.id}</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingAppointment.status}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    status: e.target.value,
                  })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={editingAppointment.appointmentDate}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    appointmentDate: e.target.value,
                  })}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="4"
                  value={editingAppointment.notes}
                  onChange={(e) => setEditingAppointment({
                    ...editingAppointment,
                    notes: e.target.value,
                  })}
                  placeholder="Add any notes about this appointment..."
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
