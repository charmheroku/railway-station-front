import React from 'react';
import Header from './Header/Header';
import Navigation from './Navigation/Navigation';
import TrainBooking from './TrainBooking/TrainBooking';
import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <Navigation />
      <TrainBooking />
    </div>
  );
}

export default App;