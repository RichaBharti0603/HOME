// src/pages/Monitoring.jsx
import React from 'react';

const Monitoring = () => {
  return (
    <div className="monitoring-page">
      <div className="container">
        <div className="page-header">
          <h1>Website Monitoring</h1>
          <p>Real-time monitoring with instant alerts for your business-critical applications</p>
        </div>

        <div className="monitoring-features">
          <div className="feature-grid">
            <div className="feature-card card">
              <h3>Uptime Monitoring</h3>
              <p>24/7 monitoring with 99.99% accuracy</p>
            </div>
            <div className="feature-card card">
              <h3>Performance Metrics</h3>
              <p>Track response time, load speed, and more</p>
            </div>
            <div className="feature-card card">
              <h3>SSL Certificate Monitoring</h3>
              <p>Get alerts before certificates expire</p>
            </div>
            <div className="feature-card card">
              <h3>Multi-location Monitoring</h3>
              <p>Check from multiple global locations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;