import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <h1>Quickai</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="#" className="nav-link">Home</a></li>
            <li><a href="#" className="nav-link">Recharge & Bill Payment</a></li>
            <li><a href="#" className="nav-link active">Booking</a></li>
            <li><a href="#" className="nav-link">Features</a></li>
            <li><a href="#" className="nav-link">Blog</a></li>
            <li><a href="#" className="nav-link">Pages</a></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <button className="login-button">Login / Sign up</button>
        </div>
      </div>
    </header>
  );
}

export default Header;