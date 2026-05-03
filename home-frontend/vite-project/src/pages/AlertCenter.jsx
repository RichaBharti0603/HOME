import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, Clock, Inbox, Check } from 'lucide-react';
import api from '../utils/api';

const AlertCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      if (localStorage.getItem('token') === 'demo-token') {
        setTimeout(() => {
          setAlerts([
            { id: 1, type: "DOWN", message: "CRITICAL: Main Website is down. DNS Resolution failed.", timestamp: new Date().toISOString(), is_resolved: false },
            { id: 2, type: "DEGRADED", message: "DEGRADED: API Server is degraded. Performance Degradation.", timestamp: new Date(Date.now() - 3600000).toISOString(), is_resolved: true }
          ]);
          setLoading(false);
        }, 500);
        return;
      }
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id) => {
    try {
      if (localStorage.getItem('token') !== 'demo-token') {
        await api.post(`/alerts/${id}/resolve`);
      }
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_resolved: true } : a));
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  const activeAlerts = alerts.filter(a => !a.is_resolved);
  const resolvedAlerts = alerts.filter(a => a.is_resolved);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Alert Center</h1>
          <p className="text-muted font-medium text-sm">Inbox style alert management and dispatch history.</p>
        </div>
      </header>

      {loading ? (
        <div className="p-16 text-center text-muted font-medium">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="p-24 text-center space-y-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Inbox className="mx-auto text-gray-300" size={48} />
          <p className="text-muted font-medium">No alerts triggered yet. Inbox is zero!</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Alerts */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={20} /> Action Required ({activeAlerts.length})
            </h2>
            {activeAlerts.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center text-sm font-medium text-gray-500">
                All clear! No active alerts.
              </div>
            ) : (
              <div className="space-y-3">
                {activeAlerts.map(alert => (
                  <div key={alert.id} className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="mt-1 p-2 bg-red-50 rounded-xl text-red-500 shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-red-50 border border-red-100 text-[10px] font-bold text-red-600 uppercase tracking-wider">{alert.type}</span>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-foreground mt-2">{alert.message}</p>
                    </div>
                    <div className="shrink-0 ml-4">
                      <button 
                        onClick={() => handleResolve(alert.id)}
                        className="px-4 py-2 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                      >
                        <Check size={14} /> Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Resolved Alerts */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={20} /> Recently Resolved
            </h2>
            <div className="space-y-3 opacity-60">
              {resolvedAlerts.slice(0, 10).map(alert => (
                <div key={alert.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start gap-4">
                   <div className="mt-1 text-gray-400 shrink-0"><CheckCircle2 size={18} /></div>
                   <div className="flex-1">
                     <p className="text-sm font-semibold text-gray-600">{alert.message}</p>
                     <p className="text-xs font-bold text-gray-400 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                   </div>
                   <div className="shrink-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-md">Resolved</span>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AlertCenter;
