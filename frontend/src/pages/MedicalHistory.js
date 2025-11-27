import React, { useState, useEffect } from 'react';
import { appointmentsAPI, prescriptionsAPI, medicalHistoryAPI, assessmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MedicalHistory.css';

const MedicalHistory = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, prescriptionsRes, recordsRes, assessmentsRes] = await Promise.all([
        appointmentsAPI.getAll(),
        prescriptionsAPI.getAll().catch(() => ({ data: { data: [] } })),
        medicalHistoryAPI.getByPatient(user.userId).catch(() => ({ data: { data: [] } })),
        assessmentsAPI.getHistory().catch(() => ({ data: { data: [] } })),
      ]);

      setAppointments(appointmentsRes.data.data || []);
      setPrescriptions(prescriptionsRes.data.data || []);
      setMedicalRecords(recordsRes.data.data || []);
      setAssessmentHistory(assessmentsRes.data.data || []);
    } catch (error) {
      console.error('Error loading medical history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      completed: 'status-completed',
      scheduled: 'status-scheduled',
      cancelled: 'status-cancelled',
      active: 'status-active',
      resolved: 'status-resolved',
    };
    return statusMap[status] || 'status-default';
  };

  if (loading) {
    return <div className="loading">Loading your medical history...</div>;
  }

  return (
    <div className="medical-history">
      <div className="page-header">
        <h1>Medical History</h1>
        <p>View your appointment history and medical records</p>
        </div>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments ({appointments.length})
        </button>
        <button
          className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          Prescriptions ({prescriptions.length})
        </button>
        <button
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          Medical Records ({medicalRecords.length})
        </button>
        <button
          className={`tab ${activeTab === 'assessments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assessments')}
        >
          Assessment History ({assessmentHistory.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'appointments' && (
          <div className="appointments-history">
            {appointments.length > 0 ? (
              <div className="history-list">
                {appointments.map((apt) => (
                  <div key={apt.id} className="history-item">
                    <div className="item-header">
                      <h3>
                        Dr. {apt.doctor_first_name} {apt.doctor_last_name}
                      </h3>
                      <span className={`status ${getStatusClass(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    
                    <div className="item-details">
                      <div className="detail-row">
                        <span className="label">Date & Time:</span>
                        <span>{formatDateTime(apt.appointment_date)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Type:</span>
                        <span>{apt.appointment_type}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Specialization:</span>
                        <span>{apt.specialization}</span>
                      </div>
                      {apt.reason && (
                        <div className="detail-row">
                          <span className="label">Reason:</span>
                          <span>{apt.reason}</span>
                        </div>
                      )}
                      {apt.notes && (
                        <div className="detail-row">
                          <span className="label">Notes:</span>
                          <span>{apt.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No appointment history</h3>
                <p>Your completed appointments will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="prescriptions-history">
            {prescriptions.length > 0 ? (
              <div className="history-list">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="history-item">
                    <div className="item-header">
                      <h3>Prescription from Dr. {prescription.doctor_name}</h3>
                      <span className="date">{formatDate(prescription.prescribed_date)}</span>
                    </div>
                    
                    <div className="item-details">
                      {prescription.diagnosis && (
                        <div className="detail-row">
                          <span className="label">Diagnosis:</span>
                          <span>{prescription.diagnosis}</span>
                        </div>
                      )}
                      {prescription.items && prescription.items.length > 0 && (
                        <div className="prescription-items">
                          <strong>Prescribed Items:</strong>
                          <ul>
                            {prescription.items.map((item, index) => (
                              <li key={index}>
                                <strong>{item.item_name}</strong> ({item.item_type})
                                {item.dosage && ` - ${item.dosage}`}
                                {item.frequency && ` - ${item.frequency}`}
                                {item.instructions && (
                                  <p className="instructions">{item.instructions}</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {prescription.notes && (
                        <div className="detail-row">
                          <span className="label">Notes:</span>
                          <span>{prescription.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No prescriptions</h3>
                <p>Your prescriptions from therapists will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div className="medical-records">
            {medicalRecords.length > 0 ? (
              <div className="history-list">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="history-item">
                    <div className="item-header">
                      <h3>{record.condition_name}</h3>
                      <span className={`status ${getStatusClass(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                    
                    <div className="item-details">
                      {record.diagnosis_date && (
                        <div className="detail-row">
                          <span className="label">Diagnosis Date:</span>
                          <span>{formatDate(record.diagnosis_date)}</span>
                        </div>
                      )}
                      {record.severity && (
                        <div className="detail-row">
                          <span className="label">Severity:</span>
                          <span className={`severity severity-${record.severity}`}>
                            {record.severity}
                          </span>
                        </div>
                      )}
                      {record.symptoms && (
                        <div className="detail-row">
                          <span className="label">Symptoms:</span>
                          <span>{record.symptoms}</span>
                        </div>
                      )}
                      {record.notes && (
                        <div className="detail-row">
                          <span className="label">Notes:</span>
                          <span>{record.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No medical records</h3>
                <p>Your medical records and diagnoses will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="assessment-history">
            {assessmentHistory.length > 0 ? (
              <div className="history-list">
                {assessmentHistory.map((assessment) => (
                  <div key={assessment.id} className="history-item assessment-item">
                    <div className="item-header">
                      <h3>{assessment.assessment_name}</h3>
                      <span className="date">{formatDateTime(assessment.created_at)}</span>
                    </div>
                    
                    <div className="item-details">
                      <div className="assessment-score">
                        <div className="score-display">
                          <span className="score-value">{assessment.score}</span>
                          <span className="score-max">/ {assessment.max_score}</span>
                        </div>
                        <div 
                          className="severity-badge"
                          style={{ 
                            backgroundColor: getSeverityColor(assessment.severity),
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                        >
                          {assessment.severity}
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Assessment Type:</span>
                        <span>{assessment.assessment_type}</span>
                      </div>
                      
                      <div className="assessment-trend">
                        {getAssessmentTrend(assessment.assessment_type)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No assessment history</h3>
                <p>Complete mental health assessments to track your progress over time</p>
                <a href="/assessments" className="btn btn-primary" style={{ marginTop: '15px', display: 'inline-block' }}>
                  Take an Assessment
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const getSeverityColor = (severity) => {
  const colorMap = {
    'Minimal': '#4caf50',
    'Mild': '#8bc34a',
    'Low Stress': '#4caf50',
    'Moderate': '#ff9800',
    'Moderate Stress': '#ff9800',
    'Moderately Severe': '#ff5722',
    'Severe': '#f44336',
    'High Stress': '#f44336'
  };
  return colorMap[severity] || '#9e9e9e';
};

const getAssessmentTrend = (type) => {
  return (
    <div className="trend-info" style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
      <span>📊 View your progress trend in the detailed history</span>
    </div>
  );
};

export default MedicalHistory;
