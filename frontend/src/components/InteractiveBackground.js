import React from 'react';
import './InteractiveBackground.css';

const InteractiveBackground = () => {
  return (
    <div className="interactive-background">
      <div className="gradient-overlay"></div>
      
      {/* Water Bubbles */}
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>
      <div className="bubble bubble-4"></div>
      <div className="bubble bubble-5"></div>
      <div className="bubble bubble-6"></div>
      <div className="bubble bubble-7"></div>
      <div className="bubble bubble-8"></div>
      
      {/* Underwater Light Rays */}
      <div className="light-ray light-ray-1"></div>
      <div className="light-ray light-ray-2"></div>
      <div className="light-ray light-ray-3"></div>
      
      {/* Floating Sparkles */}
      <div className="sparkle sparkle-1"></div>
      <div className="sparkle sparkle-2"></div>
      <div className="sparkle sparkle-3"></div>
      <div className="sparkle sparkle-4"></div>
      <div className="sparkle sparkle-5"></div>
    </div>
  );
};

export default InteractiveBackground;
