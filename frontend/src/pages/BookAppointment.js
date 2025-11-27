import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../services/api';
import './BookAppointment.css';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const preselectedDoctorId = searchParams.get('doctorId');
  const preselectedDoctorName = searchParams.get('doctorName');
  
  const [formData, setFormData] = useState({
    doctorId: preselectedDoctorId || '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    meetingMode: 'in_person',
    notes: '',
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    // Update formData if preselectedDoctorId is provided via URL
    if (preselectedDoctorId) {
      setFormData(prev => ({
        ...prev,
        doctorId: preselectedDoctorId
      }));
    }
  }, [preselectedDoctorId]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.search({ isApproved: true });
      const doctorsList = response.data.data || [];
      console.log('Loaded doctors:', doctorsList);
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, '=', value);
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.doctorId) {
      setError('Please select a therapist');
      return;
    }

    if (!formData.appointmentDate || !formData.appointmentTime) {
      setError('Please select date and time');
      return;
    }

    try {
      setSubmitting(true);
      
      // Validate doctorId
      const doctorIdNum = parseInt(formData.doctorId);
      if (!doctorIdNum || isNaN(doctorIdNum)) {
        setError('Please select a therapist');
        setSubmitting(false);
        return;
      }
      
      // Ensure time is in HH:MM format (without seconds)
      const timeFormatted = formData.appointmentTime.substring(0, 5);
      
      const appointmentData = {
        doctorId: doctorIdNum,
        appointmentDate: formData.appointmentDate,
        appointmentTime: timeFormatted,
        appointmentType: formData.appointmentType,
        meetingMode: formData.meetingMode,
        notes: formData.notes || '',
      };
      
      console.log('Sending appointment data:', appointmentData);
      
      await appointmentsAPI.create(appointmentData);

      setSuccess('Appointment booked successfully!');
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to book appointment';
      
      if (error.response?.data?.errors) {
        // Format validation errors
        errorMessage = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="book-appointment">
      <div className="page-header">
        <h1>Book an Appointment</h1>
        <p>Schedule a session with your therapist</p>
      </div>

      <div className="appointment-form-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label htmlFor="doctorId">Select Therapist *</label>
            {preselectedDoctorName && preselectedDoctorId ? (
              <div className="preselected-doctor">
                <span>✓ Dr. {preselectedDoctorName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, doctorId: '' });
                    navigate('/appointments/new');
                  }}
                  className="btn-link"
                >
                  Change
                </button>
              </div>
            ) : (
              <select
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select a therapist --</option>
                {doctors.map((doctor) => (
                  <option key={`doctor-${doctor.id}`} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                    {doctor.consultation_fee && ` ($${doctor.consultation_fee})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appointmentDate">Date *</label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={minDate}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointmentTime">Time *</label>
              <input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="appointmentType">Appointment Type *</label>
            <select
              id="appointmentType"
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleChange}
              required
            >
              <option key="appt-type-consultation" value="consultation">Consultation</option>
              <option key="appt-type-follow-up" value="follow_up">Follow-up</option>
              <option key="appt-type-therapy" value="therapy">Therapy Session</option>
              <option key="appt-type-emergency" value="emergency">Emergency</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="meetingMode">Meeting Mode *</label>
            <select
              id="meetingMode"
              name="meetingMode"
              value={formData.meetingMode}
              onChange={handleChange}
              required
            >
              <option key="mode-in-person" value="in_person">In-Person</option>
              <option key="mode-video" value="video">Video Call</option>
              <option key="mode-phone" value="phone">Phone Call</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Reason for Visit & Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="e.g., Anxiety management, Follow-up session, or any additional information you'd like to share..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${submitting ? 'btn-spinning' : ''}`}
              disabled={submitting || loading}
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Booking...
                </>
              ) : (
                'Book Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
