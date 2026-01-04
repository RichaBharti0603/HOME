// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import StatusCards from '../components/Dashboard/StatusCards';
import UptimeChart from '../components/Dashboard/UptimeChart';
import AlertFeed from '../components/Dashboard/AlertFeed';
import HealthReport from '../components/Dashboard/HealthReport';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('24h');

  const statusData = [
    { title: 'Website Uptime', value: '99.98%', status: 'healthy', change: '+0.02%' },
    { title: 'Avg Response Time', value: '124ms', status: 'healthy', change: '-12ms' },
    { title: 'SSL Validity', value: '89 days', status: 'warning', change: 'Expires soon' },
    { title: 'Active Users', value: '1,247', status: 'healthy', change: '+4.2%' },
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Website Health Dashboard</h1>
            <p>Real-time monitoring for your business-critical applications</p>
          </div>
          <div className="header-right">
            <div className="time-range-selector">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="time-select"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <button className="btn btn-primary">
              Add New Monitor
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="dashboard-section">
          <h2 className="section-subtitle">Quick Overview</h2>
          <StatusCards data={statusData} />
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="dashboard-section">
              <div className="section-header">
                <h2 className="section-subtitle">Uptime History</h2>
                <div className="legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#10b981' }}></span>
                    <span>Uptime</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                    <span>Downtime</span>
                  </div>
                </div>
              </div>
              <UptimeChart timeRange={timeRange} />
            </div>
          </div>
          <div>
            <div className="dashboard-section">
              <h2 className="section-subtitle">Recent Alerts</h2>
              <AlertFeed />
            </div>
          </div>
        </div>

        {/* Health Report */}
        <div className="dashboard-section">
          <h2 className="section-subtitle">Detailed Health Report</h2>
          <HealthReport />
        </div>

        {/* Monitoring Checks */}
        <div className="dashboard-section">
          <h2 className="section-subtitle">Active Monitors</h2>
          <div className="monitors-grid">
            {[
              { name: 'Main Website', type: 'HTTP', status: 'up', url: 'https://yourapp.com' },
              { name: 'API Endpoint', type: 'API', status: 'up', url: 'https://api.yourapp.com' },
              { name: 'Database', type: 'Ping', status: 'slow', url: 'db.yourapp.com' },
              { name: 'Payment Gateway', type: 'SSL', status: 'warning', url: 'https://payments.com' },
            ].map((monitor, index) => (
              <div key={index} className="monitor-card card">
                <div className="monitor-header">
                  <h3>{monitor.name}</h3>
                  <span className={`status-badge status-${monitor.status}`}>
                    {monitor.status.toUpperCase()}
                  </span>
                </div>
                <div className="monitor-details">
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{monitor.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">URL:</span>
                    <span className="detail-value url">{monitor.url}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Check:</span>
                    <span className="detail-value">Just now</span>
                  </div>
                </div>
                <div className="monitor-actions">
                  <button className="btn btn-secondary btn-sm">Edit</button>
                  <button className="btn btn-primary btn-sm">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 