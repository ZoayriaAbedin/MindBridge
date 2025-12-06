import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="spinner">
        <div className="brain-loader">
          <div className="brain-wave-loader"></div>
          <div className="brain-wave-loader"></div>
          <div className="brain-wave-loader"></div>
        </div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
