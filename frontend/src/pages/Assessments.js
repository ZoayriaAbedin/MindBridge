import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Assessments.css';

const Assessments = () => {
  const navigate = useNavigate();

  const assessments = [
    {
      id: 1,
      name: 'PHQ-9 (Depression)',
      description: 'Patient Health Questionnaire - Measures severity of depression',
      questions: 9,
      duration: '5 min',
      icon: '😔'
    },
    {
      id: 2,
      name: 'GAD-7 (Anxiety)',
      description: 'Generalized Anxiety Disorder - Assesses anxiety symptoms',
      questions: 7,
      duration: '3 min',
      icon: '😰'
    },
    {
      id: 3,
      name: 'PSS (Stress)',
      description: 'Perceived Stress Scale - Evaluates stress levels',
      questions: 10,
      duration: '4 min',
      icon: '😫'
    },
    {
      id: 4,
      name: 'PTSD Checklist',
      description: 'Post-Traumatic Stress Disorder screening tool',
      questions: 17,
      duration: '8 min',
      icon: '💭'
    },
    {
      id: 5,
      name: 'MDQ (Bipolar)',
      description: 'Mood Disorder Questionnaire - Screens for bipolar disorder',
      questions: 13,
      duration: '6 min',
      icon: '🎭'
    },
    {
      id: 6,
      name: 'AUDIT (Alcohol Use)',
      description: 'Alcohol Use Disorders Identification Test',
      questions: 10,
      duration: '5 min',
      icon: '🍷'
    },
    {
      id: 7,
      name: 'ASRS (ADHD)',
      description: 'Adult ADHD Self-Report Scale',
      questions: 18,
      duration: '7 min',
      icon: '⚡'
    },
    {
      id: 8,
      name: 'SPIN (Social Anxiety)',
      description: 'Social Phobia Inventory - Assesses social anxiety',
      questions: 17,
      duration: '6 min',
      icon: '👥'
    },
    {
      id: 9,
      name: 'ISI (Insomnia)',
      description: 'Insomnia Severity Index - Evaluates sleep problems',
      questions: 7,
      duration: '3 min',
      icon: '😴'
    },
    {
      id: 10,
      name: 'WEMWBS (Well-being)',
      description: 'Warwick-Edinburgh Mental Well-being Scale',
      questions: 14,
      duration: '5 min',
      icon: '🌟'
    }
  ];

  const handleStartAssessment = (assessment) => {
    navigate(`/assessments/${assessment.id}`);
  };

  return (
    <div className="assessments-page">
      <div className="assessments-header">
        <h1>Mental Health Assessments</h1>
        <p>Evidence-based screening tools to help understand your mental wellness</p>
      </div>

      <div className="staircase-container">
        {assessments.map((assessment, index) => (
          <div 
            key={assessment.id}
            className={`staircase-step step-${index + 1}`}
            onClick={() => handleStartAssessment(assessment)}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="step-content">
              <div className="step-icon">{assessment.icon}</div>
              <div className="step-info">
                <h3>{assessment.name}</h3>
                <p className="step-description">{assessment.description}</p>
                <div className="step-meta">
                  <span className="meta-item">📊 {assessment.questions} questions</span>
                  <span className="meta-item">⏱️ {assessment.duration}</span>
                </div>
              </div>
              <div className="step-arrow">→</div>
            </div>
          </div>
        ))}
      </div>

      <div className="assessment-notes">
        <div className="note-card">
          <h3>📌 Important Notes</h3>
          <ul>
            <li>All results are confidential and stored in your medical history</li>
            <li>Your assigned therapist can view results to provide better care</li>
            <li>These are screening tools, not diagnostic instruments</li>
            <li>Complete assessments honestly for accurate insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Assessments;
