// src/pages/Compliance.jsx
import React from 'react';

const Compliance = () => {
  const complianceStandards = [
    { name: 'GDPR', region: 'EU', status: 'Compliant' },
    { name: 'DPDP', region: 'India', status: 'Compliant' },
    { name: 'HIPAA', region: 'USA', status: 'Ready' },
    { name: 'SOC 2', region: 'Global', status: 'Type II Certified' },
    { name: 'ISO 27001', region: 'Global', status: 'Certified' },
  ];

  return (
    <div className="compliance-page">
      <div className="container">
        <div className="page-header">
          <h1>Compliance & Security</h1>
          <p>Built-in compliance for global regulations</p>
        </div>

        <div className="compliance-grid">
          {complianceStandards.map((standard, index) => (
            <div key={index} className="compliance-card card">
              <h3>{standard.name}</h3>
              <p className="region">{standard.region}</p>
              <div className={`status-badge status-${standard.status.toLowerCase().includes('compliant') ? 'compliant' : 'ready'}`}>
                {standard.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compliance;