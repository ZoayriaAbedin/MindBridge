import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import './DoctorSchedule.css';

const DoctorSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const [schedule, setSchedule] = useState({
    Monday: { available: false, startTime: '09:00', endTime: '17:00' },
    Tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
    Wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
    Thursday: { available: false, startTime: '09:00', endTime: '17:00' },
    Friday: { available: false, startTime: '09:00', endTime: '17:00' },
    Saturday: { available: false, startTime: '09:00', endTime: '17:00' },
    Sunday: { available: false, startTime: '09:00', endTime: '17:00' },
  });

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const response = await authAPI.getProfile();
      const profile = response.data.data;
      
      if (profile.profile?.availability_schedule) {
        const savedSchedule = JSON.parse(profile.profile.availability_schedule);
        setSchedule(savedSchedule);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const handleDayToggle = (day) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        available: !schedule[day].available
      }
    });
    setSuccess('');
    setError('');
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [field]: value
      }
    });
    setSuccess('');
    setError('');
  };

  const handleSetAllDays = () => {
    const firstDay = daysOfWeek[0];
    const template = schedule[firstDay];
    
    const newSchedule = {};
    daysOfWeek.forEach(day => {
      newSchedule[day] = { ...template };
    });
    
    setSchedule(newSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate that at least one day is available
      const hasAvailability = Object.values(schedule).some(day => day.available);
      
      if (!hasAvailability) {
        setError('Please select at least one available day');
        setLoading(false);
        return;
      }

      // Validate time ranges
      for (const [day, times] of Object.entries(schedule)) {
        if (times.available) {
          if (times.startTime >= times.endTime) {
            setError(`Invalid time range for ${day}. End time must be after start time.`);
            setLoading(false);
            return;
          }
        }
      }

      await authAPI.updateProfile({
        profile: {
          availabilitySchedule: JSON.stringify(schedule)
        }
      });

      setSuccess('Availability schedule updated successfully!');
    } catch (error) {
      console.error('Error updating schedule:', error);
      setError(error.response?.data?.message || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-schedule">
      <div className="page-header">
        <h1>Set Your Availability</h1>
        <p>Define your working hours for each day of the week</p>
      </div>

      <div className="schedule-container">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="schedule-tools">
          <button
            type="button"
            onClick={handleSetAllDays}
            className="btn btn-secondary"
          >
            Apply Monday's Schedule to All Days
          </button>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          {daysOfWeek.map((day) => (
            <div key={day} className="day-schedule">
              <div className="day-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={schedule[day].available}
                    onChange={() => handleDayToggle(day)}
                  />
                  <span className="day-name">{day}</span>
                </label>
              </div>

              {schedule[day].available && (
                <div className="time-inputs">
                  <div className="time-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={schedule[day].startTime}
                      onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                      required
                    />
                  </div>
                  <span className="time-separator">to</span>
                  <div className="time-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={schedule[day].endTime}
                      onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {!schedule[day].available && (
                <div className="unavailable-text">Unavailable</div>
              )}
            </div>
          ))}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </form>

        <div className="schedule-info">
          <h3>📋 How it works:</h3>
          <ul>
            <li>Check the days you are available to see patients</li>
            <li>Set your working hours for each available day</li>
            <li>You can copy Monday's schedule to all other days for convenience</li>
            <li>Patients will only be able to book appointments during your available hours</li>
            <li>You can update your availability at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
