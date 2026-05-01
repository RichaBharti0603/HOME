import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldCheck, Clock, 
  ChevronRight, Filter, Search, Activity,
  Calendar, CheckCircle2, History
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const IncidentTimeline = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      if (localStorage.getItem('token') === 'demo-token') {
        setIncidents([
          { 
             id: 1042, 
             status: 'RESOLVED', 
             summary: 'Elevated latency on Main Website', 
             monitor: { project_name: 'Main Website' },
             started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
             resolved_at: new Date(Date.now() - 86400000 * 2 + 1200000).toISOString()
          },
          { 
             id: 1043, 
             status: 'RESOLVED', 
             summary: 'Connection timeout', 
             monitor: { project_name: 'API Server' },
             started_at: new Date(Date.now() - 86400000 * 5).toISOString(),
             resolved_at: new Date(Date.now() - 86400000 * 5 + 300000).toISOString()
          }
        ]);
        setLoading(false);
        return;
      }

      const response = await api.get('/monitors/incidents');
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading incident history...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Incident History</h1>
          <p className="text-gray-500 font-medium">A complete log of system outages and recovery events.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
           <ShieldCheck size={18} className="text-emerald-600" />
           <span className="text-xs font-bold text-emerald-700 tracking-wide">99.98% Monthly Uptime</span>
        </div>
      </header>

      {incidents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-gray-200 shadow-sm p-16 md:p-24 text-center flex flex-col items-center gap-6"
        >
          <div className="p-6 rounded-3xl bg-emerald-50 text-emerald-500 border border-emerald-100">
            <ShieldCheck size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">All Systems Optimal</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">No incidents detected in the current period. Your websites are performing perfectly.</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {incidents.map((incident, idx) => (
            <motion.div 
              key={incident.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:border-gray-300 transition-colors"
            >
              <div className="flex items-stretch min-h-[120px]">
                <div className={`w-2 ${incident.status === 'OPEN' ? 'bg-red-500 shadow-[2px_0_10px_#EF4444]' : 'bg-emerald-500'}`}></div>
                <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                         incident.status === 'OPEN' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                       }`}>
                         {incident.status === 'OPEN' ? 'Active Incident' : 'Resolved'}
                       </span>
                       <span className="text-xs text-gray-400 font-mono font-medium">#INC-{incident.id.toString().padStart(4, '0')}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-accent-primary transition-colors">{incident.summary}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <History size={16} className="text-gray-400" />
                      Website: <span className="text-gray-900 font-semibold">{incident.monitor?.project_name || 'System Cluster'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 md:gap-12">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Started At</p>
                      <div className="flex items-center gap-2 justify-end text-sm font-bold text-gray-900">
                         <Calendar size={16} className="text-gray-400" />
                         {format(new Date(incident.started_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Duration</p>
                      <div className="flex items-center gap-2 justify-end text-sm font-bold text-gray-900">
                         <Clock size={16} className="text-gray-400" />
                         {incident.resolved_at 
                          ? `${Math.round((new Date(incident.resolved_at) - new Date(incident.started_at)) / 60000)}m` 
                          : 'Ongoing'}
                      </div>
                    </div>
                    <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="pt-10 border-t border-gray-200 flex flex-col items-center gap-4 text-center">
         <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
            <Activity size={18} className="text-accent-primary" />
            <p className="text-sm text-gray-600 font-medium">All websites are currently being monitored.</p>
         </div>
      </div>
    </div>
  );
};

export default IncidentTimeline;
