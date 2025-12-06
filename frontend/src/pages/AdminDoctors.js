import React, { useState, useEffect } from 'react';
import { doctorsAPI } from '../services/api';
import './AdminDoctors.css';
import './AdminCommon.css';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      console.log('🔍 Admin loading doctors...');
      console.log('API URL:', process.env.REACT_APP_API_URL || 'Using default');
      
      // Pass 'all' to get all doctors (both approved and pending)
      const response = await doctorsAPI.search({ isApproved: 'all' });
      const doctorsList = response.data.data || [];
      
      console.log('✅ Loaded doctors for admin:', doctorsList);
      console.log('📊 Total doctors:', doctorsList.length);
      console.log('⏳ Pending doctors:', doctorsList.filter(d => !d.is_approved).length);
      console.log('✔️ Approved doctors:', doctorsList.filter(d => d.is_approved).length);
      
      setDoctors(doctorsList);
    } catch (error) {
      console.error('❌ Error loading doctors:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert('Failed to load doctors. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    if (!window.confirm('Approve this doctor?')) return;

    try {
      await doctorsAPI.approve(doctorId);
      loadDoctors();
      alert('Doctor approved successfully');
    } catch (error) {
      console.error('Error approving doctor:', error);
      alert(error.response?.data?.message || 'Failed to approve doctor');
    }
  };

  const getFilteredDoctors = () => {
    let filtered = doctors;

    if (filter === 'approved') {
      filtered = filtered.filter(d => d.is_approved);
    } else if (filter === 'pending') {
      filtered = filtered.filter(d => !d.is_approved);
    }

    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const filteredDoctors = getFilteredDoctors();

  return (
    <div className="admin-doctors">
      <div className="page-header">
        <h1>Doctor Management</h1>
        <p>View and manage all doctors on the platform</p>
        {process.env.NODE_ENV === 'development' && (
          <small style={{ color: '#999', display: 'block', marginTop: '5px' }}>
            API: {process.env.REACT_APP_API_URL || 'default'}
          </small>
        )}
      </div>

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, specialization, or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Doctors ({doctors.length})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({doctors.filter(d => d.is_approved).length})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({doctors.filter(d => !d.is_approved).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading doctors...</div>
      ) : filteredDoctors.length > 0 ? (
        <div className="doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="doctor-card">
              <div className="doctor-header">
                <div className="doctor-info">
                  <h3>Dr. {doctor.first_name} {doctor.last_name}</h3>
                  <span className="specialization">{doctor.specialization}</span>
                  {!doctor.is_approved && (
                    <span className="pending-badge">Pending Approval</span>
                  )}
                </div>
                <div className="doctor-rating">
                  ⭐ {doctor.rating && typeof doctor.rating === 'number' ? doctor.rating.toFixed(1) : 'New'}
                  {doctor.total_reviews > 0 && (
                    <span className="review-count">({doctor.total_reviews})</span>
                  )}
                </div>
              </div>

              <div className="doctor-details">
                <div className="detail-row">
                  <span className="label">License:</span>
                  <span>{doctor.license_number}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span>{doctor.experience_years || 0} years</span>
                </div>
                <div className="detail-row">
                  <span className="label">Fee:</span>
                  <span className="fee">${doctor.consultation_fee || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span>{doctor.city ? `${doctor.city}, ${doctor.state}` : 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{doctor.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span>{doctor.phone || '-'}</span>
                </div>
                {doctor.qualifications && (
                  <div className="detail-row">
                    <span className="label">Qualifications:</span>
                    <span className="qualifications">{doctor.qualifications}</span>
                  </div>
                )}
                {doctor.bio && (
                  <div className="doctor-bio">
                    <strong>Bio:</strong>
                    <p>{doctor.bio}</p>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Joined:</span>
                  <span>{formatDate(doctor.created_at)}</span>
                </div>
              </div>

              {!doctor.is_approved && (
                <div className="doctor-actions">
                  <button
                    onClick={() => handleApprove(doctor.id)}
                    className="btn btn-success"
                  >
                    Approve Doctor
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No doctors found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
