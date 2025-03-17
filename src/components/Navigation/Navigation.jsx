import React, { useState } from 'react';
import './Navigation.css';

function Navigation() {
  const [activeTab, setActiveTab] = useState('trains');
  
  const tabs = [
    { id: 'hotels', label: 'Hotels', icon: 'hotel' },
    { id: 'flights', label: 'Flights', icon: 'flight' },
    { id: 'trains', label: 'Trains', icon: 'train' },
    { id: 'bus', label: 'Bus', icon: 'directions_bus' },
    { id: 'cars', label: 'Cars', icon: 'directions_car' }
  ];
  
  return (
    <div className="navigation">
      <div className="container">
        <div className="tabs">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-icons">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Navigation;