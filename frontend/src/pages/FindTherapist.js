import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import './FindTherapist.css';

const FindTherapist = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: searchParams.get('specialization') || '',
    city: '',
    minRating: '',
    maxFee: '',
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.search(filters);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadDoctors();
  };

  const handleBookAppointment = (doctor) => {
    navigate(`/appointments/new?doctorId=${doctor.id}&doctorName=${doctor.first_name} ${doctor.last_name}`);
  };

  return (
    <div className="find-therapist">
      <div className="page-header">
        <h1>Find a Therapist</h1>
        <p>Search for mental health professionals that match your needs</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-row">
            <div className="form-group">
              <label>Specialization</label>
              <select
                name="specialization"
                value={filters.specialization}
                onChange={handleFilterChange}
              >
                <option value="">All Specializations</option>
                <option value="Anxiety">Anxiety</option>
                <option value="Depression">Depression</option>
                <option value="PTSD">PTSD</option>
                <option value="Addiction">Addiction</option>
                <option value="Couples Therapy">Couples Therapy</option>
                <option value="Child Psychology">Child Psychology</option>
                <option value="Family Therapy">Family Therapy</option>
              </select>
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Enter city"
              />
            </div>

            <div className="form-group">
              <label>Min Rating</label>
              <select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            <div className="form-group">
              <label>Max Fee ($)</label>
              <input
                type="number"
                name="maxFee"
                value={filters.maxFee}
                onChange={handleFilterChange}
                placeholder="e.g., 200"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="results-section">
        {loading ? (
          <div className="loading">Loading therapists...</div>
        ) : doctors.length > 0 ? (
          <div className="therapists-grid">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="therapist-card">
                <div className="therapist-header">
                  <div className="therapist-avatar">
                    {doctor.profile_picture ? (
                      <img src={doctor.profile_picture} alt={doctor.first_name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {doctor.first_name[0]}{doctor.last_name[0]}
                      </div>
                    )}
                  </div>
                  <div className="therapist-info">
                    <h3>Dr. {doctor.first_name} {doctor.last_name}</h3>
                    <p className="specialization">{doctor.specialization}</p>
                    <div className="rating">
                      ⭐ {doctor.rating && typeof doctor.rating === 'number' ? doctor.rating.toFixed(1) : 'New'} 
                      {doctor.total_reviews > 0 && ` (${doctor.total_reviews} reviews)`}
                    </div>
                  </div>
                </div>

                <div className="therapist-details">
                  {doctor.experience_years > 0 && (
                    <p>
                      <strong>Experience:</strong> {doctor.experience_years} years
                    </p>
                  )}
                  {doctor.city && (
                    <p>
                      <strong>Location:</strong> {doctor.city}, {doctor.state}
                    </p>
                  )}
                  {doctor.consultation_fee && (
                    <p>
                      <strong>Consultation Fee:</strong> ${doctor.consultation_fee}
                    </p>
                  )}
                  {doctor.bio && (
                    <p className="bio">{doctor.bio.substring(0, 150)}...</p>
                  )}
                </div>

                <div className="therapist-actions">
                  <Link 
                    to={`/doctors/${doctor.id}`} 
                    className="btn btn-secondary"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    className="btn btn-primary"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No therapists found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindTherapist;
