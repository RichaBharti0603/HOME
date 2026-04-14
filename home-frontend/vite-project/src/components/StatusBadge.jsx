import React from 'react';

const StatusBadge = ({ status }) => {
  const config = {
    UP: {
      bg: 'bg-status-up/10',
      text: 'text-status-up',
      border: 'border-status-up/20',
      dot: 'bg-status-up',
      label: 'Operational'
    },
    DOWN: {
      bg: 'bg-status-down/10',
      text: 'text-status-down',
      border: 'border-status-down/20',
      dot: 'bg-status-down',
      label: 'Outage'
    },
    UNKNOWN: {
      bg: 'bg-muted/10',
      text: 'text-muted',
      border: 'border-muted/20',
      dot: 'bg-muted',
      label: 'Signal Lost'
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
