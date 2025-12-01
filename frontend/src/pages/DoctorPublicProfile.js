import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import './DoctorPublicProfile.css';

const DoctorPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDoctorProfile();
  }, [id]);

  const loadDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.getById(id);
      setDoctor(response.data.data);
    } catch (error) {
      console.error('Error loading doctor profile:', error);
      setError('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    navigate(`/appointments/new?doctorId=${doctor.id}&doctorName=${doctor.first_name} ${doctor.last_name}`);
  };

  if (loading) {
    return <div className="loading">Loading doctor profile...</div>;
  }

  if (error || !doctor) {
    return (
      <div className="error-container">
        <h2>Profile Not Found</h2>
        <p>{error || 'This doctor profile could not be found.'}</p>
        <button onClick={() => navigate('/doctors')} className="btn btn-primary">
          Back to Therapists
        </button>
      </div>
    );
  }

  return (
    <div className="doctor-public-profile">
      <div className="profile-header">
        <button onClick={() => navigate('/doctors')} className="back-btn">
          ← Back to Therapists
        </button>
        <h1>Dr. {doctor.first_name} {doctor.last_name}</h1>
        <p className="specialization">{doctor.specialization}</p>
        {doctor.rating > 0 && (
          <div className="rating">
            ⭐ {doctor.rating.toFixed(1)} 
            {doctor.total_reviews > 0 && (
              <span className="reviews">({doctor.total_reviews} reviews)</span>
            )}
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>About Dr. {doctor.last_name}</h2>
          {doctor.bio ? (
            <p className="bio">{doctor.bio}</p>
          ) : (
            <p className="no-info">No biography available</p>
          )}
        </div>

        <div className="profile-grid">
          <div className="profile-section">
            <h3>Professional Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Specialization:</span>
                <span className="value">{doctor.specialization}</span>
              </div>
              <div className="info-item">
                <span className="label">Experience:</span>
                <span className="value">{doctor.experience_years || 0} years</span>
              </div>
              <div className="info-item">
                <span className="label">License Number:</span>
                <span className="value">{doctor.license_number}</span>
              </div>
              <div className="info-item">
                <span className="label">Consultation Fee:</span>
                <span className="value fee">${doctor.consultation_fee}</span>
              </div>
            </div>
          </div>

          {doctor.qualifications && (
            <div className="profile-section">
              <h3>Qualifications</h3>
              <p>{doctor.qualifications}</p>
            </div>
          )}

          {(doctor.city || doctor.state) && (
            <div className="profile-section">
              <h3>Location</h3>
              <p>
                {doctor.address && <>{doctor.address}<br /></>}
                {doctor.city && doctor.state ? `${doctor.city}, ${doctor.state}` : doctor.city || doctor.state}
                {doctor.zip_code && ` ${doctor.zip_code}`}
              </p>
            </div>
          )}

          <div className="profile-section">
            <h3>Contact Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{doctor.email}</span>
              </div>
              {doctor.phone && (
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{doctor.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="action-section">
          <button onClick={handleBookAppointment} className="btn btn-primary btn-large">
            Book Appointment with Dr. {doctor.last_name}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPublicProfile;
