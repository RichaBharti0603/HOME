import React, { useState, useEffect } from 'react';
import { Activity, Server, Clock, AlertCircle, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const QueueHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchHealth = async () => {
    try {
      if (localStorage.getItem('token') === 'demo-token') {
        setTimeout(() => {
          setHealthData({
            status: "online",
            active_workers: 2,
            pending_jobs: 14,
            running_jobs: 5,
            throughput: "120 jobs/min",
            latency_ms: "45ms"
          });
          setLoading(false);
          setLastUpdated(new Date());
        }, 800);
        return;
      }
      
      const res = await api.get('/health/queue');
      setHealthData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch queue health data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Queue Health</h1>
          <p className="text-muted font-medium text-sm">Real-time metrics for the Celery job queue and worker fleet.</p>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchHealth(); }}
          className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      ) : loading && !healthData ? (
        <div className="p-16 text-center text-muted font-medium">Loading telemetry...</div>
      ) : healthData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Status Card */}
            <div className="bento-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider">System Status</span>
                {healthData.status === 'online' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-500" />}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${healthData.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-red-500 animate-pulse'}`}></div>
                <span className="text-2xl font-bold text-foreground capitalize">{healthData.status}</span>
              </div>
            </div>

            {/* Workers */}
            <div className="bento-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Workers</span>
                <Server size={16} />
              </div>
              <p className="text-3xl font-extrabold text-foreground font-mono">{healthData.active_workers}</p>
            </div>

            {/* Pending Jobs */}
            <div className="bento-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Jobs</span>
                <Layers size={16} />
              </div>
              <p className="text-3xl font-extrabold text-foreground font-mono">{healthData.pending_jobs}</p>
            </div>

            {/* Running Jobs */}
            <div className="bento-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-muted mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider">Running Jobs</span>
                <Activity size={16} />
              </div>
              <p className="text-3xl font-extrabold text-foreground font-mono text-accent-primary">{healthData.running_jobs}</p>
            </div>
          </div>

          <div className="bento-card flex items-center justify-between bg-gray-50/50">
             <div className="flex gap-8">
               <div>
                  <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Latency</p>
                  <p className="text-sm font-bold text-foreground mt-1">{healthData.latency_ms}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Throughput</p>
                  <p className="text-sm font-bold text-foreground mt-1">{healthData.throughput}</p>
               </div>
             </div>
             <p className="text-xs text-muted font-medium flex items-center gap-1">
               <Clock size={12} /> Last updated: {lastUpdated.toLocaleTimeString()}
             </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default QueueHealth;
