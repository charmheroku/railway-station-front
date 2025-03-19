import React from 'react';
import { Route } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import SeatSelection from './components/SeatSelection';
import MyBookings from './components/MyBookings';

const App = () => {
  return (
    <div>
      <Route path="/trips/:tripId/booking" element={<BookingForm />} />
      <Route path="/trips/:tripId/seats" element={<SeatSelection />} />
      <Route path="/bookings" element={<MyBookings />} />
    </div>
  );
};

export default App; 