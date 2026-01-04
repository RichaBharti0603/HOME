// src/components/Dashboard/HealthReport.jsx
import React from 'react';

const HealthReport = () => {
  const checks = [
    { name: 'Uptime', status: 'pass', value: '99.98%' },
    { name: 'SSL Certificate', status: 'warning', value: 'Expires in 89 days' },
    { name: 'Response Time', status: 'pass', value: '124ms avg' },
    { name: 'Security Headers', status: 'pass', value: 'All present' },
    { name: 'DNS Resolution', status: 'pass', value: 'Healthy' },
    { name: 'Content Delivery', status: 'pass', value: 'Optimized' },
  ];

  return (
    <div className="health-report card">
      <table className="report-table">
        <thead>
          <tr>
            <th>Check</th>
            <th>Status</th>
            <th>Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((check, index) => (
            <tr key={index}>
              <td>{check.name}</td>
              <td>
                <span className={`status-dot status-${check.status}`}></span>
                {check.status === 'pass' ? 'Pass' : 'Warning'}
              </td>
              <td>{check.value}</td>
              <td>
                <button className="btn btn-secondary btn-sm">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HealthReport;