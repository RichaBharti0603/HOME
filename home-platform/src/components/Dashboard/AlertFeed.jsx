// src/components/Dashboard/AlertFeed.jsx
import React from 'react';

const AlertFeed = () => {
  const alerts = [
    { id: 1, type: 'warning', message: 'SSL certificate expires in 89 days', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'Backup completed successfully', time: '5 hours ago' },
    { id: 3, type: 'success', message: 'All systems operational', time: '1 day ago' },
    { id: 4, type: 'error', message: 'High response time detected - 850ms', time: '2 days ago', resolved: true },
  ];

  return (
    <div className="alert-feed">
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert-item ${alert.type} ${alert.resolved ? 'resolved' : ''}`}>
          <div className="alert-content">
            <div className="alert-message">{alert.message}</div>
            <div className="alert-time">{alert.time}</div>
          </div>
          {alert.resolved && (
            <span className="resolved-badge">Resolved</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default AlertFeed;