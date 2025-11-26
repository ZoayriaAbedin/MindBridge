import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, usersAPI } from '../services/api';
import './DoctorProfile.css';

const DoctorProfile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    licenseNumber: '',
    specialization: '',
    qualifications: '',
    experienceYears: '',
    bio: '',
    consultationFee: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const profile = response.data.data;
      setProfileData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        licenseNumber: profile.license_number || '',
        specialization: profile.specialization || '',
        qualifications: profile.qualifications || '',
        experienceYears: profile.experience_years || '',
        bio: profile.bio || '',
        consultationFee: profile.consultation_fee || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        country: profile.country || 'USA',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        license_number: profileData.licenseNumber,
        specialization: profileData.specialization,
        qualifications: profileData.qualifications,
        experience_years: parseInt(profileData.experienceYears) || 0,
        bio: profileData.bio,
        consultation_fee: parseFloat(profileData.consultationFee) || 0,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zipCode,
        country: profileData.country,
      });

      updateUser(response.data.data);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-profile">
      <div className="page-header">
        <h1>Doctor Profile</h1>
        <p>Manage your professional information and credentials</p>
      </div>

      <div className="profile-form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Personal Information */}
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  placeholder="555-1234"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="form-section">
            <h2>Professional Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="licenseNumber">License Number *</label>
                <input
                  type="text"
                  id="licenseNumber"
                  name="licenseNumber"
                  value={profileData.licenseNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., MD123456"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialization">Specialization *</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={profileData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Anxiety">Anxiety</option>
                  <option value="Depression">Depression</option>
                  <option value="PTSD">PTSD</option>
                  <option value="Addiction">Addiction</option>
                  <option value="Couples Therapy">Couples Therapy</option>
                  <option value="Child Psychology">Child Psychology</option>
                  <option value="Family Therapy">Family Therapy</option>
                  <option value="Eating Disorders">Eating Disorders</option>
                  <option value="Bipolar Disorder">Bipolar Disorder</option>
                  <option value="OCD">OCD</option>
                  <option value="General Psychiatry">General Psychiatry</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="qualifications">Qualifications *</label>
              <textarea
                id="qualifications"
                name="qualifications"
                value={profileData.qualifications}
                onChange={handleChange}
                rows="3"
                placeholder="e.g., MD from Harvard Medical School, Board Certified Psychiatrist"
                required
              />
              <small className="form-text">List your degrees, certifications, and training</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experienceYears">Years of Experience *</label>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  value={profileData.experienceYears}
                  onChange={handleChange}
                  min="0"
                  max="60"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="consultationFee">Consultation Fee ($) *</label>
                <input
                  type="number"
                  id="consultationFee"
                  name="consultationFee"
                  value={profileData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g., 150.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Professional Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                rows="5"
                placeholder="Tell patients about your approach to therapy, areas of expertise, and what they can expect from working with you..."
              />
              <small className="form-text">This will be visible to patients searching for therapists</small>
            </div>
          </div>

          {/* Location Information */}
          <div className="form-section">
            <h2>Practice Location</h2>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={profileData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={profileData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={profileData.zipCode}
                  onChange={handleChange}
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
