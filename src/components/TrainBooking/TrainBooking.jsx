import React from 'react';
import SearchForm from './SearchForm';
import FeatureCard from './FeatureCard';
import './TrainBooking.css';

function TrainBooking() {
  const features = [
    {
      id: 1,
      title: 'Cheapest Price',
      description: 'Always get cheapest price with the best in the industry. So you get the best deal every time!',
      icon: 'percent'
    },
    {
      id: 2,
      title: 'Easy Cancellation & Refunds',
      description: 'Get instant refund and get any booking fees waived off!',
      icon: 'close'
    },
    {
      id: 3,
      title: 'No Booking Charges',
      description: 'No hidden charges, no payment fees, and free customer service. So you get the best deal every time!',
      icon: 'attach_money'
    },
    {
      id: 4,
      title: 'Every time, anywhere',
      description: 'Because your trip doesn\'t end with a ticket, we\'re here for you all the way',
      icon: 'favorite'
    }
  ];

  return (
    <div className="train-booking">
      <div className="container">
        <div className="booking-container">
          <div className="search-section">
            <h2 className="section-title">Book Train Tickets</h2>
            <SearchForm />
          </div>
          <div className="banner-section">
            <div className="banner">
              <div className="banner-content">
                <h2>BOOK TRAIN TICKETS ONLINE</h2>
                <p>Save Time and Money!</p>
                <div className="banner-indicators">
                  <span className="indicator active"></span>
                  <span className="indicator"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="features-section">
          <h2 className="section-title">Why Book Trains with Quickai</h2>
          <p className="section-subtitle">Book Train Tickets Online. Save Time and Money!</p>
          
          <div className="features-grid">
            {features.map(feature => (
              <FeatureCard 
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainBooking;