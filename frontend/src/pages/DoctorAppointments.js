import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, medicalHistoryAPI } from '../services/api';
import messagingAPI from '../services/messaging';
import { assessmentsAPI } from '../services/api';
import './DoctorAppointments.css';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = { role: 'doctor' };
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await appointmentsAPI.getAll(params);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleViewPatientHistory = async (appointment) => {
    try {
      setLoading(true);
      // Fetch medical history
      const historyResponse = await medicalHistoryAPI.getByPatient(appointment.patient_id);
      
      // Fetch assessment history for the specific patient
      let assessments = [];
      try {
        const assessmentResponse = await assessmentsAPI.getHistory({ patientId: appointment.patient_id });
        assessments = assessmentResponse.data?.data || assessmentResponse.data || [];
      } catch (err) {
        console.log('No assessments found:', err);
      }

      setPatientHistory({
        patient: {
          name: `${appointment.patient_first_name} ${appointment.patient_last_name}`,
          id: appointment.patient_id,
          email: appointment.patient_email,
        },
        records: historyResponse.data?.data || historyResponse.data || [],
        assessments: assessments,
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error loading patient history:', error);
      alert(error.response?.data?.message || 'Failed to load patient history');
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
        cancelled_by: 'doctor',
        cancellation_reason: 'Cancelled by doctor',
      });
      loadAppointments();
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    if (!window.confirm('Mark this appointment as completed?')) {
      return;
    }

    try {
      await appointmentsAPI.update(appointmentId, { status: 'completed' });
      loadAppointments();
      alert('Appointment marked as completed');
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
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

  return (
    <div className="doctor-appointments">
      <div className="page-header">
        <h1>My Appointments</h1>
        <p>Manage your patient appointments</p>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Scheduled
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : appointments.length > 0 ? (
        <div className="appointments-list">
          {appointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-header">
                <div className="patient-info">
                  <h3>{apt.patient_first_name} {apt.patient_last_name}</h3>
                  <span className={`status ${getStatusClass(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
                <div className="appointment-fee">
                  ৳{apt.consultation_fee || 0}
                </div>
              </div>

              <div className="appointment-details">
                <div className="detail-row">
                  <span className="label">📅 Date & Time:</span>
                  <span>{formatDateTime(apt.appointment_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">📍 Type:</span>
                  <span className="appointment-type">{apt.appointment_type}</span>
                </div>
                {apt.reason && (
                  <div className="detail-row">
                    <span className="label">💭 Reason:</span>
                    <span>{apt.reason}</span>
                  </div>
                )}
                {apt.notes && (
                  <div className="detail-row">
                    <span className="label">📝 Notes:</span>
                    <span>{apt.notes}</span>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                <button
                  onClick={async () => {
                    try {
                      const response = await messagingAPI.getOrCreateConversationWithPatient(apt.patient_id);
                      const conversation = {
                        id: response.data.id,
                        patient_id: response.data.patient_id,
                        doctor_id: response.data.doctor_id,
                        other_user_id: apt.patient_id,
                        other_user_name: `${apt.patient_first_name} ${apt.patient_last_name}`,
                        other_user_role: 'patient'
                      };
                      navigate('/messages', { 
                        state: { selectedConversation: conversation } 
                      });
                    } catch (error) {
                      console.error('Error starting conversation:', error);
                      alert('Failed to start conversation. Please try again.');
                    }
                  }}
                  className="btn btn-outline"
                >
                  💬 Message Patient
                </button>
                <button
                  onClick={() => handleViewPatientHistory(apt)}
                  className="btn btn-secondary"
                >
                  View Patient History
                </button>
                
                {apt.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleCompleteAppointment(apt.id)}
                      className="btn btn-success"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      className="btn btn-danger"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No appointments found</h3>
          <p>You don't have any {filter !== 'all' ? filter : ''} appointments</p>
        </div>
      )}

      {/* Patient History Modal */}
      {showModal && patientHistory && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content patient-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Medical History - {patientHistory.patient.name}</h2>
                <p className="patient-email">{patientHistory.patient.email}</p>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {/* Medical Conditions */}
              <div className="history-section">
                <h3>📋 Medical Conditions</h3>
                {patientHistory.records.length > 0 ? (
                  <div className="history-records">
                    {patientHistory.records.map((record) => (
                      <div key={record.id} className="history-record">
                        <div className="record-header">
                          <h4>{record.condition_name}</h4>
                          <span className={`severity severity-${record.severity}`}>
                            {record.severity}
                          </span>
                        </div>
                        <div className="record-details">
                          {record.diagnosis_date && (
                            <p><strong>Diagnosed:</strong> {new Date(record.diagnosis_date).toLocaleDateString()}</p>
                          )}
                          <p><strong>Status:</strong> <span className="status-badge">{record.status}</span></p>
                          {record.symptoms && (
                            <p><strong>Symptoms:</strong> {record.symptoms}</p>
                          )}
                          {record.notes && (
                            <p><strong>Notes:</strong> {record.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No medical conditions recorded</p>
                )}
              </div>

              {/* Assessment History */}
              <div className="history-section">
                <h3>🧠 Mental Health Assessments</h3>
                {patientHistory.assessments && patientHistory.assessments.length > 0 ? (
                  <div className="assessments-grid">
                    {patientHistory.assessments.map((assessment, index) => (
                      <div key={index} className="assessment-card">
                        <div className="assessment-header">
                          <h4>{assessment.assessment_name}</h4>
                          <span className={`severity-badge ${assessment.severity?.toLowerCase()}`}>
                            {assessment.severity || 'N/A'}
                          </span>
                        </div>
                        <div className="assessment-score">
                          <span className="score">{assessment.score}</span>
                          <span className="max-score">/ {assessment.max_score}</span>
                        </div>
                        <p className="assessment-date">
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No assessments completed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
