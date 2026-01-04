// src/components/Layout/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Monitoring', path: '/monitoring' },
    { name: 'AI Assistant', path: '/ai-assistant' },
    { name: 'Compliance', path: '/compliance' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="logo">
              <div className="logo-icon">
                <span className="logo-home">H</span>
              </div>
              <span className="logo-text">HOME</span>
            </Link>
          </div>

          <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
            <Link to="/contact" className="btn btn-secondary">
              Contact Sales
            </Link>
            <Link to="/dashboard" className="btn btn-primary">
              Get Started
            </Link>
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="menu-icon"></span>
              <span className="menu-icon"></span>
              <span className="menu-icon"></span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;