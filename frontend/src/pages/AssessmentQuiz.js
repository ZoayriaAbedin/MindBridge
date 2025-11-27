import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AssessmentQuiz.css';

const AssessmentQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const assessmentData = {
    1: {
      name: 'PHQ-9 (Depression)',
      description: 'Patient Health Questionnaire - Measures severity of depression',
      questions: [
        'Little interest or pleasure in doing things',
        'Feeling down, depressed, or hopeless',
        'Trouble falling asleep, staying asleep, or sleeping too much',
        'Feeling tired or having little energy',
        'Poor appetite or overeating',
        'Feeling bad about yourself or that you are a failure',
        'Trouble concentrating on things',
        'Moving or speaking slowly, or being fidgety',
        'Thoughts that you would be better off dead or hurting yourself'
      ],
      scale: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ],
      scoring: [
        { range: [0, 4], severity: 'Minimal', color: '#4caf50' },
        { range: [5, 9], severity: 'Mild', color: '#8bc34a' },
        { range: [10, 14], severity: 'Moderate', color: '#ff9800' },
        { range: [15, 19], severity: 'Moderately Severe', color: '#ff5722' },
        { range: [20, 27], severity: 'Severe', color: '#f44336' }
      ]
    },
    2: {
      name: 'GAD-7 (Anxiety)',
      description: 'Generalized Anxiety Disorder - Assesses anxiety symptoms',
      questions: [
        'Feeling nervous, anxious, or on edge',
        'Not being able to stop or control worrying',
        'Worrying too much about different things',
        'Trouble relaxing',
        'Being so restless that it is hard to sit still',
        'Becoming easily annoyed or irritable',
        'Feeling afraid as if something awful might happen'
      ],
      scale: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' }
      ],
      scoring: [
        { range: [0, 4], severity: 'Minimal', color: '#4caf50' },
        { range: [5, 9], severity: 'Mild', color: '#8bc34a' },
        { range: [10, 14], severity: 'Moderate', color: '#ff9800' },
        { range: [15, 21], severity: 'Severe', color: '#f44336' }
      ]
    },
    3: {
      name: 'PSS (Stress)',
      description: 'Perceived Stress Scale - Evaluates stress levels',
      questions: [
        'Been upset because of something that happened unexpectedly',
        'Felt unable to control important things in your life',
        'Felt nervous and stressed',
        'Felt confident about your ability to handle personal problems',
        'Felt that things were going your way',
        'Found that you could not cope with all the things you had to do',
        'Been able to control irritations in your life',
        'Felt that you were on top of things',
        'Been angered because of things outside of your control',
        'Felt difficulties were piling up so high you could not overcome them'
      ],
      scale: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Almost Never' },
        { value: 2, label: 'Sometimes' },
        { value: 3, label: 'Fairly Often' },
        { value: 4, label: 'Very Often' }
      ],
      scoring: [
        { range: [0, 13], severity: 'Low Stress', color: '#4caf50' },
        { range: [14, 26], severity: 'Moderate Stress', color: '#ff9800' },
        { range: [27, 40], severity: 'High Stress', color: '#f44336' }
      ]
    }
  };

  const assessment = assessmentData[id] || assessmentData[1];

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const result = assessment.scoring.find(
      s => totalScore >= s.range[0] && totalScore <= s.range[1]
    );
    
    // Store results in medical history (you'll need to implement backend API)
    localStorage.setItem('lastAssessmentResult', JSON.stringify({
      assessmentId: id,
      assessmentName: assessment.name,
      score: totalScore,
      severity: result?.severity,
      date: new Date().toISOString(),
      userId: user?.id
    }));

    setShowResults(true);
  };

  const getResults = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    return assessment.scoring.find(
      s => totalScore >= s.range[0] && totalScore <= s.range[1]
    );
  };

  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;

  if (showResults) {
    const result = getResults();
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);

    return (
      <div className="assessment-quiz">
        <div className="results-container">
          <div className="results-header">
            <h1>Assessment Complete! ✨</h1>
            <p>{assessment.name}</p>
          </div>

          <div className="results-card">
            <div className="score-circle" style={{ borderColor: result.color }}>
              <div className="score-value" style={{ color: result.color }}>
                {totalScore}
              </div>
              <div className="score-label">Total Score</div>
            </div>

            <div className="severity-badge" style={{ backgroundColor: result.color }}>
              {result.severity}
            </div>

            <div className="results-info">
              <h3>What This Means</h3>
              <p>Your results have been saved to your medical history. Your therapist will be able to review these results to provide better care.</p>
            </div>

            <div className="results-actions">
              <button onClick={() => navigate('/assessments')} className="btn btn-primary">
                Take Another Assessment
              </button>
              <button onClick={() => navigate('/medical-history')} className="btn btn-secondary">
                View Medical History
              </button>
              <button onClick={() => navigate('/doctors')} className="btn btn-secondary">
                Find a Therapist
              </button>
            </div>

            <div className="disclaimer">
              <p>⚠️ This is a screening tool, not a diagnosis. Please consult with a mental health professional for proper evaluation and treatment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-quiz">
      <div className="quiz-container">
        <div className="quiz-header">
          <h1>{assessment.name}</h1>
          <p>{assessment.description}</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">Question {currentQuestion + 1} of {assessment.questions.length}</p>
        </div>

        <div className="question-card">
          <h2>Over the last 2 weeks, how often have you been bothered by:</h2>
          <h3>{assessment.questions[currentQuestion]}</h3>

          <div className="answer-options">
            {assessment.scale.map((option) => (
              <button
                key={option.value}
                className={`answer-btn ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
                onClick={() => handleAnswer(option.value)}
              >
                <span className="answer-radio">
                  {answers[currentQuestion] === option.value && '✓'}
                </span>
                <span className="answer-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            ← Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            className="btn btn-primary"
          >
            {currentQuestion === assessment.questions.length - 1 ? 'Submit' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuiz;
