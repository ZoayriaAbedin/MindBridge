import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, medicalHistoryAPI } from '../services/api';
import './DoctorAppointments.css';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [newHistory, setNewHistory] = useState({
    conditionName: '',
    diagnosisDate: '',
    severity: 'moderate',
    status: 'active',
    symptoms: '',
    notes: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // Get all appointments for this doctor
      const response = await appointmentsAPI.getAll();
      const appointments = response.data.data || [];

      // Extract unique patients
      const patientMap = new Map();
      appointments.forEach(apt => {
        if (!patientMap.has(apt.patient_id)) {
          patientMap.set(apt.patient_id, {
            id: apt.patient_id,
            firstName: apt.patient_first_name,
            lastName: apt.patient_last_name,
            email: apt.patient_email,
            totalAppointments: 0,
            completedAppointments: 0,
            lastAppointment: null
          });
        }
        
        const patient = patientMap.get(apt.patient_id);
        patient.totalAppointments++;
        
        if (apt.status === 'completed') {
          patient.completedAppointments++;
        }
        
        if (!patient.lastAppointment || new Date(apt.appointment_date) > new Date(patient.lastAppointment)) {
          patient.lastAppointment = apt.appointment_date;
        }
      });

      setPatients(Array.from(patientMap.values()).sort((a, b) => 
        new Date(b.lastAppointment) - new Date(a.lastAppointment)
      ));
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedicalHistory = async (patientId) => {
    try {
      setHistoryLoading(true);
      const response = await medicalHistoryAPI.getByPatient(patientId);
      setMedicalHistory(response.data.data || []);
    } catch (error) {
      console.error('Error loading medical history:', error);
      if (error.response?.status === 403) {
        alert('Access denied. You can only view medical history of your patients.');
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setShowAddHistory(false);
    loadMedicalHistory(patient.id);
  };

  const handleAddHistory = async (e) => {
    e.preventDefault();
    try {
      await medicalHistoryAPI.add(selectedPatient.id, newHistory);
      alert('Medical history added successfully');
      setShowAddHistory(false);
      setNewHistory({
        conditionName: '',
        diagnosisDate: '',
        severity: 'moderate',
        status: 'active',
        symptoms: '',
        notes: ''
      });
      loadMedicalHistory(selectedPatient.id);
    } catch (error) {
      console.error('Error adding medical history:', error);
      alert(error.response?.data?.message || 'Failed to add medical history');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      mild: '#27ae60',
      moderate: '#f39c12',
      severe: '#e67e22',
      critical: '#e74c3c'
    };
    return <span style={{ 
      backgroundColor: colors[severity] || '#95a5a6',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    }}>{severity}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: '#e74c3c',
      resolved: '#27ae60',
      chronic: '#f39c12',
      in_remission: '#3498db'
    };
    return <span style={{ 
      backgroundColor: colors[status] || '#95a5a6',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    }}>{status.replace('_', ' ')}</span>;
  };

  return (
    <div className="doctor-appointments">
      <div className="page-header">
        <h1>Patient Records</h1>
        <p>View medical history of your patients</p>
      </div>

      <div className="appointments-layout">
        {/* Left sidebar - Patient list */}
        <div className="appointments-sidebar">
          <h3>My Patients ({patients.length})</h3>
          {loading ? (
            <div className="loading">Loading patients...</div>
          ) : patients.length > 0 ? (
            <div className="patient-list">
              {patients.map(patient => (
                <div
                  key={patient.id}
                  className={`patient-item ${selectedPatient?.id === patient.id ? 'active' : ''}`}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <h4>{patient.firstName} {patient.lastName}</h4>
                  <p className="patient-email">{patient.email}</p>
                  <div className="patient-stats">
                    <span>📅 {patient.totalAppointments} appointments</span>
                    <span>✅ {patient.completedAppointments} completed</span>
                    <span>🕐 Last: {formatDate(patient.lastAppointment)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No patients yet</p>
            </div>
          )}
        </div>

        {/* Right content - Medical history */}
        <div className="appointments-main">
          {selectedPatient ? (
            <>
              <div className="patient-header">
                <div>
                  <h2>{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                  <p>{selectedPatient.email}</p>
                </div>
                <button
                  onClick={() => setShowAddHistory(!showAddHistory)}
                  className="btn btn-primary"
                >
                  {showAddHistory ? 'Cancel' : '+ Add Medical Record'}
                </button>
              </div>

              {showAddHistory && (
                <div className="add-history-form">
                  <h3>Add Medical History Entry</h3>
                  <form onSubmit={handleAddHistory}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Condition Name *</label>
                        <input
                          type="text"
                          value={newHistory.conditionName}
                          onChange={(e) => setNewHistory({...newHistory, conditionName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Diagnosis Date</label>
                        <input
                          type="date"
                          value={newHistory.diagnosisDate}
                          onChange={(e) => setNewHistory({...newHistory, diagnosisDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Severity</label>
                        <select
                          value={newHistory.severity}
                          onChange={(e) => setNewHistory({...newHistory, severity: e.target.value})}
                        >
                          <option value="mild">Mild</option>
                          <option value="moderate">Moderate</option>
                          <option value="severe">Severe</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={newHistory.status}
                          onChange={(e) => setNewHistory({...newHistory, status: e.target.value})}
                        >
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                          <option value="chronic">Chronic</option>
                          <option value="in_remission">In Remission</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Symptoms</label>
                      <textarea
                        value={newHistory.symptoms}
                        onChange={(e) => setNewHistory({...newHistory, symptoms: e.target.value})}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <textarea
                        value={newHistory.notes}
                        onChange={(e) => setNewHistory({...newHistory, notes: e.target.value})}
                        rows="3"
                      />
                    </div>
                    <button type="submit" className="btn btn-success">Add Record</button>
                  </form>
                </div>
              )}

              <div className="medical-history-section">
                <h3>Medical History</h3>
                {historyLoading ? (
                  <div className="loading">Loading medical history...</div>
                ) : medicalHistory.length > 0 ? (
                  <div className="history-list">
                    {medicalHistory.map(record => (
                      <div key={record.id} className="history-card">
                        <div className="history-header">
                          <h4>{record.condition_name}</h4>
                          <div className="history-badges">
                            {getSeverityBadge(record.severity)}
                            {getStatusBadge(record.status)}
                          </div>
                        </div>
                        <div className="history-details">
                          <p><strong>Diagnosis Date:</strong> {formatDate(record.diagnosis_date)}</p>
                          {record.symptoms && (
                            <p><strong>Symptoms:</strong> {record.symptoms}</p>
                          )}
                          {record.notes && (
                            <p><strong>Notes:</strong> {record.notes}</p>
                          )}
                          <p className="history-footer">
                            <small>
                              Reported by: Dr. {record.reported_by_first_name} {record.reported_by_last_name} on {formatDate(record.created_at)}
                            </small>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No medical history recorded for this patient</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <h3>Select a patient to view their medical history</h3>
              <p>Choose a patient from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;
