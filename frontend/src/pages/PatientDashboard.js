import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, doctorsAPI, supportGroupsAPI } from '../services/api';
import './Dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [apptRes, doctorRes, groupRes] = await Promise.all([
        appointmentsAPI.getAll({ limit: 5 }),
        doctorsAPI.getRecommended().catch(() => ({ data: { data: [] } })),
        supportGroupsAPI.getMyGroups().catch(() => ({ data: { data: [] } })),
      ]);

      setAppointments(apptRes.data.data || []);
      setRecommendedDoctors(doctorRes.data.data || []);
      setMyGroups(groupRes.data.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.firstName}! 👋</h1>
        <p>Here's what's happening with your mental health journey</p>
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/doctors" className="action-btn">
              <span className="icon">🔍</span>
              <span>Find a Therapist</span>
            </Link>
            <Link to="/appointments/new" className="action-btn">
              <span className="icon">📅</span>
              <span>Book Appointment</span>
            </Link>
            <Link to="/support-groups" className="action-btn">
              <span className="icon">👥</span>
              <span>Join Support Group</span>
            </Link>
            <Link to="/medical-history" className="action-btn">
              <span className="icon">📋</span>
              <span>View Medical History</span>
            </Link>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/appointments">View All</Link>
          </div>
          {appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="appointment-item">
                  <div className="apt-date">
                    {new Date(apt.appointment_date).toLocaleDateString()}
                  </div>
                  <div className="apt-info">
                    <strong>Dr. {apt.doctor_first_name} {apt.doctor_last_name}</strong>
                    <p>{apt.specialization}</p>
                    <span className={`status status-${apt.status}`}>{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No upcoming appointments</p>
              <Link to="/doctors" className="btn btn-primary btn-sm">Find a Therapist</Link>
            </div>
          )}
        </div>

        {/* Recommended Doctors */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recommended for You</h2>
            <Link to="/doctors">See All</Link>
          </div>
          {recommendedDoctors.length > 0 ? (
            <div className="doctors-list">
              {recommendedDoctors.slice(0, 3).map((doctor) => (
                <div key={doctor.id} className="doctor-item">
                  <div className="doctor-info">
                    <strong>Dr. {doctor.first_name} {doctor.last_name}</strong>
                    <p>{doctor.specialization}</p>
                    <span className="rating">⭐ {doctor.rating || 'New'}</span>
                  </div>
                  <Link to={`/doctors/${doctor.id}`} className="btn btn-sm">View</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Complete your profile to get personalized recommendations</p>
              <Link to="/profile" className="btn btn-primary btn-sm">Update Profile</Link>
            </div>
          )}
        </div>

        {/* Support Groups */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>My Support Groups</h2>
            <Link to="/support-groups">Browse All</Link>
          </div>
          {myGroups.length > 0 ? (
            <div className="groups-list">
              {myGroups.map((group) => (
                <div key={group.id} className="group-item">
                  <div className="group-info">
                    <strong>{group.name}</strong>
                    <p>{group.group_type} • {group.current_members} members</p>
                  </div>
                  <Link to={`/support-groups/${group.id}`} className="btn btn-sm">View</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't joined any support groups yet</p>
              <Link to="/support-groups" className="btn btn-primary btn-sm">Explore Groups</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
