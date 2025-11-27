import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Games.css';

const Games = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      name: 'Breathing Garden',
      description: 'Guided breathing exercises in a peaceful virtual garden with calming visuals',
      category: 'Relaxation',
      duration: '5-10 min',
      icon: '🌸',
      difficulty: 'Easy',
      benefits: ['Reduces anxiety', 'Improves focus', 'Stress relief']
    },
    {
      id: 3,
      name: 'Gratitude Journal',
      description: 'Interactive journaling with prompts, mood tracking, and positive affirmations',
      category: 'Reflection',
      duration: '5-15 min',
      icon: '📖',
      difficulty: 'Easy',
      benefits: ['Positive thinking', 'Self-awareness', 'Emotional health']
    },
    {
      id: 4,
      name: 'Color Sorting',
      description: 'Relax while organizing colorful balls into matching jars at your own pace',
      category: 'Focus',
      duration: '5-15 min',
      icon: '🎨',
      difficulty: 'Easy',
      benefits: ['Focus', 'Mindfulness', 'Visual processing']
    },
    {
      id: 5,
      name: 'Reaction Time',
      description: 'Calm reaction training that improves awareness and present-moment focus',
      category: 'Awareness',
      duration: '3-10 min',
      icon: '⚡',
      difficulty: 'Medium',
      benefits: ['Awareness', 'Concentration', 'Mental agility']
    },
    {
      id: 6,
      name: 'Tower of Hanoi',
      description: 'Meditative puzzle that promotes patience, planning, and peaceful problem-solving',
      category: 'Mindful Puzzle',
      duration: '10-20 min',
      icon: '🗼',
      difficulty: 'Medium',
      benefits: ['Patience', 'Strategic thinking', 'Calmness']
    }
  ];

  const handlePlayGame = (game) => {
    navigate(`/games/${game.id}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4caf50';
      case 'Medium': return '#ff9800';
      case 'Hard': return '#f44336';
      default: return '#42a5f5';
    }
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>Mindful Games & Activities</h1>
        <p>Peaceful interactive experiences for mental wellness and relaxation</p>
      </div>

      <div className="games-grid">
        {games.map((game, index) => (
          <div 
            key={game.id}
            className="game-card"
            onClick={() => handlePlayGame(game)}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="game-icon-container">
              <div className="game-icon">{game.icon}</div>
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(game.difficulty) }}
              >
                {game.difficulty}
              </span>
            </div>
            
            <div className="game-content">
              <h3>{game.name}</h3>
              <p className="game-category">🏷️ {game.category}</p>
              <p className="game-description">{game.description}</p>
              
              <div className="game-meta">
                <span className="meta-duration">⏱️ {game.duration}</span>
              </div>

              <div className="game-benefits">
                <p className="benefits-title">Benefits:</p>
                <div className="benefits-tags">
                  {game.benefits.map((benefit, idx) => (
                    <span key={idx} className="benefit-tag">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              <button className="play-btn">
                <span>▶ Play Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="games-info">
        <div className="info-card">
          <h3>🎮 About Mindful Games</h3>
          <p>Our games are designed by mental health professionals to promote relaxation, mindfulness, and emotional well-being. Take regular breaks, enjoy the journey, and remember - there's no winning or losing, only peaceful exploration.</p>
        </div>
      </div>
    </div>
  );
};

export default Games;
