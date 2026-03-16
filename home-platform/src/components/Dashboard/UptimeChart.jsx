// src/components/Dashboard/UptimeChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UptimeChart = ({ timeRange }) => {
  // Sample data - in real app, this would come from API
  const data = [
    { time: '00:00', uptime: 100, response: 120 },
    { time: '04:00', uptime: 100, response: 125 },
    { time: '08:00', uptime: 100, response: 115 },
    { time: '12:00', uptime: 99.8, response: 130 },
    { time: '16:00', uptime: 100, response: 122 },
    { time: '20:00', uptime: 100, response: 118 },
    { time: '23:59', uptime: 100, response: 124 },
  ];

  return (
    <div className="uptime-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis stroke="#6b7280" domain={[98, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="uptime" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UptimeChart;