import React from 'react';

const StatusBadge = ({ status }) => {
  const config = {
    UP: {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      border: 'border-green-500/20',
      dot: 'bg-green-500',
      label: 'Operational'
    },
    DOWN: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      dot: 'bg-red-500',
      label: 'Outage'
    },
    UNKNOWN: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-500',
      border: 'border-gray-500/20',
      dot: 'bg-gray-500',
      label: 'Synchronizing'
    },
  };

  const current = config[status] || config.UNKNOWN;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${current.bg} ${current.text} ${current.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} ${status === 'UP' ? 'animate-pulse' : ''}`}></span>
      {current.label}
    </span>
  );
};

export default StatusBadge;
