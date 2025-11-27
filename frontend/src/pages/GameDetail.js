import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameDetail.css';

// Color Sorting Game Component
const ColorSortingGame = ({ color }) => {
  const [tubes, setTubes] = useState([
    ['red', 'blue', 'green', 'yellow'],
    ['blue', 'red', 'yellow', 'green'],
    ['green', 'yellow', 'red', 'blue'],
    ['yellow', 'green', 'blue', 'red'],
    [], []
  ]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const ballColors = {
    red: '#f44336',
    blue: '#2196f3',
    green: '#4caf50',
    yellow: '#ffeb3b'
  };

  const jarColors = {
    0: '#ffcdd2', // Light red jar
    1: '#bbdefb', // Light blue jar
    2: '#c8e6c9', // Light green jar
    3: '#fff9c4', // Light yellow jar
    4: 'rgba(200, 200, 200, 0.3)', // Empty jar
    5: 'rgba(200, 200, 200, 0.3)'  // Empty jar
  };

  const checkWin = (currentTubes) => {
    // Check if all non-empty tubes have 4 balls of the same color
    const filledTubes = currentTubes.filter(tube => tube.length > 0);
    
    for (let tube of filledTubes) {
      // A winning tube must have exactly 4 balls
      if (tube.length !== 4) return false;
      
      // All balls in the tube must be the same color
      const firstColor = tube[0];
      if (!tube.every(ball => ball === firstColor)) return false;
    }
    
    // Must have exactly 4 filled tubes (one for each color)
    return filledTubes.length === 4;
  };

  const handleTubeClick = (tubeIndex) => {
    if (isComplete) return; // Prevent moves after winning
    
    if (selectedTube === null) {
      if (tubes[tubeIndex].length > 0) {
        setSelectedTube(tubeIndex);
      }
    } else {
      if (selectedTube === tubeIndex) {
        setSelectedTube(null);
      } else {
        const fromTube = tubes[selectedTube];
        const toTube = tubes[tubeIndex];
        
        if (toTube.length < 4 && (toTube.length === 0 || toTube[toTube.length - 1] === fromTube[fromTube.length - 1])) {
          const newTubes = [...tubes];
          const ball = newTubes[selectedTube].pop();
          newTubes[tubeIndex].push(ball);
          setTubes(newTubes);
          setMoves(moves + 1);
          
          // Check for win condition
          if (checkWin(newTubes)) {
            setIsComplete(true);
          }
        }
        setSelectedTube(null);
      }
    }
  };

  const resetGame = () => {
    setTubes([
      ['red', 'blue', 'green', 'yellow'],
      ['blue', 'red', 'yellow', 'green'],
      ['green', 'yellow', 'red', 'blue'],
      ['yellow', 'green', 'blue', 'red'],
      [], []
    ]);
    setSelectedTube(null);
    setMoves(0);
    setIsComplete(false);
  };

  return (
    <div className="color-sorting-game">
      {isComplete && (
        <div className="completion-message">
          🎉 Perfect! All colors sorted in {moves} moves! 🎉
        </div>
      )}
      <div className="game-stats">
        <p>Moves: {moves}</p>
      </div>
      <div className="jars-container">
        {tubes.map((tube, tubeIndex) => (
          <div 
            key={tubeIndex}
            className={`jar ${selectedTube === tubeIndex ? 'selected' : ''} ${isComplete ? 'completed' : ''}`}
            onClick={() => handleTubeClick(tubeIndex)}
            style={{
              background: `linear-gradient(to bottom, ${jarColors[tubeIndex]}, ${jarColors[tubeIndex]}dd)`
            }}
          >
            <div className="jar-opening"></div>
            <div className="jar-body">
              {[...Array(4)].map((_, slotIndex) => (
                <div 
                  key={slotIndex}
                  className="ball-slot"
                  style={{
                    backgroundColor: tube[slotIndex] ? ballColors[tube[slotIndex]] : 'transparent',
                    border: tube[slotIndex] ? 'none' : '2px dashed rgba(0,0,0,0.1)'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="game-hint">
        {isComplete 
          ? 'Congratulations! You completed the puzzle!' 
          : 'Click a jar to select, then click another to pour'}
      </p>
      {isComplete && (
        <button 
          onClick={resetGame} 
          className="reset-btn"
          style={{ background: color, marginTop: '20px' }}
        >
          🔄 Play Again
        </button>
      )}
    </div>
  );
};

// Reaction Time Game Component
const ReactionTimeGame = ({ color }) => {
  const [state, setState] = useState('ready'); // ready, waiting, go, result
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(null);

  const startGame = () => {
    setState('waiting');
    const delay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      setState('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (state === 'waiting') {
      setState('ready');
      return;
    }
    if (state === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      setState('result');
    }
  };

  return (
    <div className="reaction-game">
      <div 
        className={`reaction-area ${state}`}
        onClick={state === 'ready' ? startGame : handleClick}
        style={{
          backgroundColor: state === 'go' ? color : state === 'waiting' ? '#ff5722' : '#e0e0e0'
        }}
      >
        {state === 'ready' && <div className="reaction-text">Click to Start</div>}
        {state === 'waiting' && <div className="reaction-text">Wait for green...</div>}
        {state === 'go' && <div className="reaction-text">CLICK NOW!</div>}
        {state === 'result' && (
          <div className="reaction-text">
            <div>{reactionTime}ms</div>
            {bestTime && <div className="best-time">Best: {bestTime}ms</div>}
          </div>
        )}
      </div>
      {state === 'result' && (
        <button onClick={() => setState('ready')} className="try-again-btn">
          Try Again
        </button>
      )}
    </div>
  );
};

// Tower of Hanoi Game Component
const TowerOfHanoiGame = ({ color }) => {
  const [towers, setTowers] = useState([[3, 2, 1], [], []]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleTowerClick = (towerIndex) => {
    if (selectedTower === null) {
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex);
      }
    } else {
      if (selectedTower === towerIndex) {
        setSelectedTower(null);
      } else {
        const fromTower = towers[selectedTower];
        const toTower = towers[towerIndex];
        const disk = fromTower[fromTower.length - 1];
        
        if (toTower.length === 0 || disk < toTower[toTower.length - 1]) {
          const newTowers = towers.map(t => [...t]);
          newTowers[selectedTower].pop();
          newTowers[towerIndex].push(disk);
          setTowers(newTowers);
          setMoves(moves + 1);
          
          if (newTowers[2].length === 3) {
            setIsComplete(true);
          }
        }
        setSelectedTower(null);
      }
    }
  };

  const resetGame = () => {
    setTowers([[3, 2, 1], [], []]);
    setMoves(0);
    setIsComplete(false);
    setSelectedTower(null);
  };

  const diskColors = {
    1: '#ffeb3b',
    2: '#ff9800',
    3: '#f44336'
  };

  return (
    <div className="hanoi-game">
      {isComplete && (
        <div className="completion-message" style={{ color }}>
          🎉 Complete in {moves} moves! (Minimum: 7)
        </div>
      )}
      <div className="game-stats">
        <p>Moves: {moves}</p>
      </div>
      <div className="towers-container">
        {towers.map((tower, towerIndex) => (
          <div 
            key={towerIndex}
            className={`hanoi-tower ${selectedTower === towerIndex ? 'selected' : ''}`}
            onClick={() => handleTowerClick(towerIndex)}
          >
            <div className="tower-pole"></div>
            <div className="disks-container">
              {tower.map((disk, diskIndex) => (
                <div
                  key={diskIndex}
                  className="hanoi-disk"
                  style={{
                    width: `${disk * 50}px`,
                    backgroundColor: diskColors[disk]
                  }}
                />
              ))}
            </div>
            <div className="tower-base"></div>
          </div>
        ))}
      </div>
      <button onClick={resetGame} className="reset-btn" style={{ background: color }}>
        Reset Puzzle
      </button>
    </div>
  );
};

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const gamesData = {
    1: {
      name: 'Breathing Garden',
      description: 'Guided breathing exercises in a peaceful virtual garden',
      icon: '🌸',
      instructions: 'Follow the visual cues to breathe in and out. Inhale when the flower blooms, exhale as it closes.',
      color: '#e91e63'
    },
    2: {
      name: 'Ocean Meditation',
      description: 'Immersive ocean soundscapes with guided meditation',
      icon: '🌊',
      instructions: 'Close your eyes and listen to the waves. Let the ocean sounds wash away your stress.',
      color: '#2196f3'
    },
    3: {
      name: 'Gratitude Journal',
      description: 'Interactive journaling with prompts and positive affirmations',
      icon: '📖',
      instructions: 'Reflect on three things you\'re grateful for today. Type freely and honestly.',
      color: '#9c27b0'
    },
    4: {
      name: 'Color Sorting',
      description: 'Organize colorful orbs into matching containers',
      icon: '🎨',
      instructions: 'Drag and drop colored balls into their matching tubes. Take your time and enjoy the process.',
      color: '#ff9800'
    },
    5: {
      name: 'Reaction Time',
      description: 'Calm reaction training for awareness',
      icon: '⚡',
      instructions: 'Click when the circle turns green. Stay present and focused on the moment.',
      color: '#4caf50'
    },
    6: {
      name: 'Tower of Hanoi',
      description: 'Meditative puzzle for peaceful problem-solving',
      icon: '🗼',
      instructions: 'Move all disks to the rightmost tower. Only one disk at a time, and never place larger on smaller.',
      color: '#673ab7'
    }
  };

  const game = gamesData[id] || gamesData[1];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnd = () => {
    setIsPlaying(false);
    // Save session data to backend
    const sessionData = {
      gameId: id,
      gameName: game.name,
      duration: sessionTime,
      date: new Date().toISOString()
    };
    localStorage.setItem('lastGameSession', JSON.stringify(sessionData));
    navigate('/games');
  };

  return (
    <div className="game-detail">
      <div className="game-container">
        <div className="game-header">
          <button onClick={() => navigate('/games')} className="back-btn">
            ← Back to Games
          </button>
          <div className="game-title">
            <span className="game-title-icon">{game.icon}</span>
            <h1>{game.name}</h1>
          </div>
          <p className="game-desc">{game.description}</p>
        </div>

        <div className="game-canvas" style={{ borderColor: game.color }}>
          {!isPlaying ? (
            <div className="game-start-screen">
              <div className="game-icon-large" style={{ color: game.color }}>
                {game.icon}
              </div>
              <h2>Ready to begin?</h2>
              <div className="instructions-box">
                <h3>Instructions:</h3>
                <p>{game.instructions}</p>
              </div>
              <button 
                onClick={handleStart} 
                className="start-btn"
                style={{ background: `linear-gradient(135deg, ${game.color}, ${game.color}dd)` }}
              >
                <span>▶ Start Experience</span>
              </button>
            </div>
          ) : (
            <div className="game-active-screen">
              <div className="session-timer" style={{ color: game.color }}>
                ⏱️ {formatTime(sessionTime)}
              </div>
              
              {/* Game-specific content */}
              <div className="game-content">
                {id === '1' && (
                  <div className="breathing-animation">
                    <div className="breath-circle" style={{ borderColor: game.color }}>
                      <div className="breath-text">Breathe</div>
                    </div>
                    <p className="breath-instruction">Inhale... Hold... Exhale...</p>
                  </div>
                )}
                
                {id === '3' && (
                  <div className="journal-area">
                    <textarea 
                      placeholder="What are you grateful for today?"
                      className="gratitude-input"
                      rows="10"
                    />
                  </div>
                )}

                {id === '4' && <ColorSortingGame color={game.color} />}

                {id === '5' && <ReactionTimeGame color={game.color} />}

                {id === '6' && <TowerOfHanoiGame color={game.color} />}
              </div>

              <div className="game-controls">
                <button onClick={handlePause} className="control-btn pause-btn">
                  ⏸ Pause
                </button>
                <button onClick={handleEnd} className="control-btn end-btn">
                  ⏹ End Session
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="game-tips">
          <h3>💡 Tips for Best Experience</h3>
          <ul>
            <li>Find a quiet, comfortable space</li>
            <li>Use headphones if available</li>
            <li>Take deep breaths throughout</li>
            <li>There's no rush - go at your own pace</li>
            <li>Focus on the present moment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
