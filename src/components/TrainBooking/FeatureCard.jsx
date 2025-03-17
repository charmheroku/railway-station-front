import React from 'react';
import './TrainBooking.css';

function FeatureCard({ title, description, icon }) {
  return (
    <div className="feature-card">
      <div className={`feature-icon ${icon}`}>
        <span className="material-icons">{icon}</span>
      </div>
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  );
}

export default FeatureCard;