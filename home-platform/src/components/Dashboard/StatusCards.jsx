// src/components/Dashboard/StatusCards.jsx
import React from 'react';

const StatusCards = ({ data }) => {
  return (
    <div className="status-cards">
      <div className="grid grid-cols-4 gap-4">
        {data.map((item, index) => (
          <div key={index} className="status-card card">
            <div className="status-header">
              <h3 className="status-title">{item.title}</h3>
              <span className={`status-indicator ${item.status}`}></span>
            </div>
            <div className="status-content">
              <div className="status-value">{item.value}</div>
              <div className={`status-change ${item.status === 'warning' ? 'warning' : 'positive'}`}>
                {item.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusCards;