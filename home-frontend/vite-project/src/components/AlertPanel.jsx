import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import api from '../utils/api';

const AlertPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/alerts');
        setAlerts(response.data);
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Check for new alerts every 10s
    return () => clearInterval(interval);
  }, []);

  const resolveAlert = async (id) => {
    try {
      await api.post(`/alerts/${id}/resolve`);
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_resolved: true } : a));
    } catch (err) {
      console.error('Failed to resolve alert');
    }
  };

  const unreadCount = alerts.filter(a => !a.is_resolved).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-background">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass rounded-premium overflow-hidden z-50">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-sm">System Alerts</h3>
            <button onClick={() => setIsOpen(false)}><X size={16}/></button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No recent alerts</div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className={`p-4 border-b border-border last:border-0 ${alert.is_resolved ? 'opacity-50' : 'bg-red-500/5'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{alert.project_name}</span>
                      <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded font-bold ${
                        alert.type === 'DOWN' ? 'bg-red-500 text-white' : 
                        alert.type === 'SLOW' ? 'bg-yellow-500 text-black' : 
                        'bg-green-500 text-white'
                      }`}>
                        {alert.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 mb-2">{alert.message}</p>
                  {!alert.is_resolved && (
                    <button 
                      onClick={() => resolveAlert(alert.id)}
                      className="text-[10px] text-accent-primary hover:underline font-bold uppercase tracking-tighter"
                    >
                      Mark as resolved
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertPanel;
