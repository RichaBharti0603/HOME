import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldCheck, Clock, 
  ChevronRight, Filter, Search, Activity
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';

const IncidentTimeline = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const response = await api.get('/monitors/incidents'); // Need to implement this endpoint
      setIncidents(response.data);
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Incident Timeline</h1>
        <p className="text-gray-400">Historical log of all system outages and recovery events.</p>
      </header>

      {incidents.length === 0 ? (
        <div className="premium-card p-12 text-center flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-green-500/10 text-green-500">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Systems Operational</h3>
            <p className="text-gray-500">No incidents detected in the last 30 days. You're fully optimized.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="premium-card p-0 overflow-hidden border-accent-primary/5">
              <div className="flex items-stretch">
                <div className={`w-1.5 ${incident.status === 'OPEN' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                         incident.status === 'OPEN' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                       }`}>
                         {incident.status}
                       </span>
                       <span className="text-xs text-gray-500 font-mono">#{incident.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{incident.summary}</h3>
                    <p className="text-sm text-gray-500">
                      Target: <span className="text-gray-300 font-medium">{incident.monitor?.project_name || 'System Node'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Start Time</p>
                      <p className="text-sm text-gray-300">{format(new Date(incident.started_at), 'MMM d, HH:mm')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-sm text-gray-300">
                        {incident.resolved_at 
                          ? `${Math.round((new Date(incident.resolved_at) - new Date(incident.started_at)) / 60000)}m` 
                          : 'Ongoing'}
                      </p>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentTimeline;
