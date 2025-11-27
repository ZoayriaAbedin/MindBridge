import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import './AdminDoctors.css';
import './AdminCommon.css';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({ role: 'patient' });
      console.log('Loaded patients:', response.data.data);
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId) => {
    if (!window.confirm('Activate this patient account?')) return;

    try {
      await usersAPI.activate(userId);
      loadPatients();
      alert('Patient account activated successfully');
    } catch (error) {
      console.error('Error activating patient:', error);
      alert(error.response?.data?.message || 'Failed to activate patient');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this patient account? They will not be able to log in.')) return;

    try {
      await usersAPI.deactivate(userId);
      loadPatients();
      alert('Patient account deactivated successfully');
    } catch (error) {
      console.error('Error deactivating patient:', error);
      alert(error.response?.data?.message || 'Failed to deactivate patient');
    }
  };

  const getFilteredPatients = () => {
    let filtered = patients;

    if (filter === 'active') {
      filtered = filtered.filter(p => p.is_active);
    } else if (filter === 'inactive') {
      filtered = filtered.filter(p => !p.is_active);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredPatients = getFilteredPatients();

  return (
    <div className="admin-doctors">
      <div className="page-header">
        <h1>Patient Management</h1>
        <p>View and manage all patients on the platform</p>
      </div>

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Patients ({patients.length})
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({patients.filter(p => p.is_active).length})
          </button>
          <button
            className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Inactive ({patients.filter(p => !p.is_active).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading patients...</div>
      ) : filteredPatients.length > 0 ? (
        <div className="doctors-grid">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="doctor-card">
              <div className="doctor-header">
                <div className="doctor-info">
                  <h3>{patient.first_name} {patient.last_name}</h3>
                  <span className="specialization">{patient.email}</span>
                  {!patient.is_active && (
                    <span className="pending-badge" style={{ backgroundColor: '#e74c3c' }}>
                      Inactive Account
                    </span>
                  )}
                  {patient.is_verified && (
                    <span className="pending-badge" style={{ backgroundColor: '#27ae60' }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="doctor-details">
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{patient.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span>{patient.phone || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={patient.is_active ? 'status-active' : 'status-inactive'}>
                    {patient.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Verified:</span>
                  <span>{patient.is_verified ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Joined:</span>
                  <span>{formatDate(patient.created_at)}</span>
                </div>
              </div>

              <div className="doctor-actions">
                {patient.is_active ? (
                  <button
                    onClick={() => handleDeactivate(patient.id)}
                    className="btn btn-danger"
                  >
                    Deactivate Account
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(patient.id)}
                    className="btn btn-success"
                  >
                    Activate Account
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No patients found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
