import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const brainActions = [
    { 
      id: 'therapist', 
      label: 'Find a Therapist', 
      path: '/doctors',
      icon: '🔍',
      position: { top: '20%', left: '15%' },
      hemisphere: 'left'
    },
    { 
      id: 'appointment', 
      label: 'Book Appointment', 
      path: '/appointments/new',
      icon: '📅',
      position: { top: '35%', left: '10%' },
      hemisphere: 'left'
    },
    { 
      id: 'assessment', 
      label: 'Take Assessment', 
      path: '/assessments',
      icon: '📝',
      position: { top: '50%', left: '12%' },
      hemisphere: 'left'
    },
    { 
      id: 'support', 
      label: 'Join Support Group', 
      path: '/support-groups',
      icon: '👥',
      position: { top: '20%', right: '15%' },
      hemisphere: 'right'
    },
    { 
      id: 'games', 
      label: 'Mindful Games', 
      path: '/games',
      icon: '🎮',
      position: { top: '35%', right: '10%' },
      hemisphere: 'right'
    },
    { 
      id: 'history', 
      label: 'View Medical History', 
      path: '/medical-history',
      icon: '📋',
      position: { bottom: '25%', right: '10%' },
      hemisphere: 'right'
    }
  ];

  return (
    <div className="brain-dashboard">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user?.firstName}! 🧠</h1>
        <p>Explore your mental wellness journey</p>
      </div>

      <div className="brain-container">
        {/* Action buttons with icons */}
        <div className="brain-actions">
          {brainActions.map((action) => (
            <div
              key={action.id}
              className={`action-node ${action.hemisphere} ${hoveredRegion === action.id ? 'active' : ''}`}
              style={action.position}
              onMouseEnter={() => setHoveredRegion(action.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => navigate(action.path)}
            >
              <div className="node-circle">
                <span className="node-icon">{action.icon}</span>
              </div>
              <div className="node-connector"></div>
              <div className="node-label">{action.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-subtitle">
        <p>Click on any feature to get started with your mental wellness journey</p>
      </div>
    </div>
  );
};

export default PatientDashboard;
