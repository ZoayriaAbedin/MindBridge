import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../services/api';
import { appointmentsAPI as appointmentAvailability } from '../services/messaging';
import './BookAppointment.css';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [suggestedTime, setSuggestedTime] = useState('');
  const availableDateSet = new Set(availableDates);
  
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
      loadAvailableDates(preselectedDoctorId);
    }
  }, [preselectedDoctorId]);

  useEffect(() => {
    // Load available slots when doctor and date are selected
    if (formData.doctorId && formData.appointmentDate) {
      loadAvailableSlots(formData.doctorId, formData.appointmentDate);
    }
  }, [formData.doctorId, formData.appointmentDate]);

  const loadAvailableDates = async (doctorId) => {
    try {
      const response = await appointmentAvailability.getAvailableDates(doctorId);
      if (response.data.success) {
        setAvailableDates(response.data.availableDates || []);
      }
    } catch (error) {
      console.error('Error loading available dates:', error);
    }
  };

  const loadAvailableSlots = async (doctorId, date) => {
    try {
      setLoadingSlots(true);
      const response = await appointmentAvailability.getAvailableSlots(doctorId, date);
      if (response.data.success) {
        const slots = response.data.availableSlots || [];
        setAvailableSlots(slots);
        
        // Auto-suggest first available time
        if (slots.length > 0) {
          setSuggestedTime(slots[0]);
          setFormData(prev => ({
            ...prev,
            appointmentTime: slots[0]
          }));
        } else {
          setSuggestedTime('');
          setFormData(prev => ({
            ...prev,
            appointmentTime: ''
          }));
        }
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

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
    
    // If doctor changes, load their available dates
    if (name === 'doctorId') {
      setFormData({
        ...formData,
        [name]: value,
        appointmentDate: '', // Reset date
        appointmentTime: '' // Reset time
      });
      if (value) {
        loadAvailableDates(value);
      } else {
        setAvailableDates([]);
        setAvailableSlots([]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
  };

  const handleDateClick = (dateStr, isAvailable) => {
    if (!isAvailable) return;
    setFormData((prev) => ({
      ...prev,
      appointmentDate: dateStr,
      appointmentTime: ''
    }));
    setSuggestedTime('');
  };

  const renderCalendar = () => {
    const today = new Date();
    const days = [];

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      days.push({
        date: d,
        dateStr,
        day: d.getDate(),
        weekday: d.getDay(),
        monthKey,
        available: availableDateSet.has(dateStr)
      });
    }

    const grouped = days.reduce((acc, day) => {
      acc[day.monthKey] = acc[day.monthKey] || [];
      acc[day.monthKey].push(day);
      return acc;
    }, {});

    const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return Object.entries(grouped).map(([monthKey, monthDays]) => {
      const [year, monthIndex] = monthKey.split('-').map(Number);
      const monthLabel = new Date(year, monthIndex).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      // Align first day of the month in grid
      const leadingBlanks = monthDays[0].date.getDay();
      const cells = [];
      for (let i = 0; i < leadingBlanks; i++) {
        cells.push({ empty: true, id: `lead-${monthKey}-${i}` });
      }
      monthDays.forEach((d) => cells.push(d));
      while (cells.length % 7 !== 0) {
        cells.push({ empty: true, id: `trail-${monthKey}-${cells.length}` });
      }

      return (
        <div className="calendar-month" key={monthKey}>
          <div className="calendar-header">{monthLabel}</div>
          <div className="calendar-weekdays">
            {weekdayLabels.map((w) => (
              <div key={w} className="calendar-weekday">{w}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {cells.map((cell, idx) => {
              if (cell.empty) {
                return <div className="calendar-cell empty" key={cell.id} />;
              }
              const isSelected = formData.appointmentDate === cell.dateStr;
              const classes = [
                'calendar-cell',
                'day',
                cell.available ? 'available' : 'unavailable',
                isSelected ? 'selected' : ''
              ].join(' ');
              return (
                <button
                  type="button"
                  key={`${cell.dateStr}-${idx}`}
                  className={classes}
                  onClick={() => handleDateClick(cell.dateStr, cell.available)}
                  disabled={!cell.available}
                  aria-label={cell.dateStr}
                >
                  <span className="day-number">{cell.day}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    });
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
                    {doctor.consultation_fee && ` (৳${doctor.consultation_fee})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appointmentDate">Date *</label>
              {formData.doctorId && availableDates.length > 0 ? (
                <div className="calendar-wrapper">
                  {renderCalendar()}
                  {!formData.appointmentDate && (
                    <small className="form-hint">Tap a highlighted date to continue</small>
                  )}
                </div>
              ) : (
                <>
                  <input
                    type="date"
                    id="appointmentDate"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={minDate}
                    required
                    disabled={!formData.doctorId}
                    title={!formData.doctorId ? 'Please select a doctor first' : ''}
                  />
                  {formData.doctorId && availableDates.length === 0 && (
                    <small className="form-hint">Doctor has not set availability schedule</small>
                  )}
                </>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="appointmentTime">Time *</label>
              {loadingSlots ? (
                <input
                  type="text"
                  value="Loading available times..."
                  disabled
                  className="loading-input"
                />
              ) : availableSlots.length > 0 ? (
                <>
                  <select
                    id="appointmentTime"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                  >
                    {availableSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {suggestedTime && (
                    <small className="form-hint success">
                      ✓ Your appointment time: {suggestedTime}
                    </small>
                  )}
                </>
              ) : formData.appointmentDate ? (
                <>
                  <input
                    type="text"
                    value="Unavailable on this date"
                    disabled
                    className="unavailable-input"
                  />
                  <small className="form-hint error">
                    No available time slots on this date. Please select another date.
                  </small>
                </>
              ) : (
                <input
                  type="time"
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                  disabled={!formData.appointmentDate}
                  title={!formData.appointmentDate ? 'Please select a date first' : ''}
                />
              )}
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
