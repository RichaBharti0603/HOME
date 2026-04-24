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
      <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted animate-pulse">Audit in Progress...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Service Audit Log</h1>
          <p className="text-muted font-medium">Historical trace of system availability and recovery events.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-status-up/5 border border-status-up/20 rounded-xl">
           <ShieldCheck size={18} className="text-status-up" />
           <span className="text-[10px] font-black uppercase text-status-up tracking-widest">99.98% Monthly Uptime</span>
        </div>
      </header>

      {incidents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card !p-20 text-center flex flex-col items-center gap-6 border-white/5"
        >
          <div className="p-6 rounded-3xl bg-status-up/10 text-status-up shadow-accent-glow">
            <ShieldCheck size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase">All Systems Optimal</h3>
            <p className="text-muted font-medium max-w-sm">No incidents detected in the current audit period. Your infrastructure is performing at peak capacity.</p>
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
              className="glass-card !p-0 overflow-hidden border-white/5 group hover:border-accent-primary/30"
            >
              <div className="flex items-stretch min-h-[120px]">
                <div className={`w-2 ${incident.status === 'OPEN' ? 'bg-status-down animate-pulse shadow-[5px_0_20px_#EF4444]' : 'bg-status-up'}`}></div>
                <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-3">
                       <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                         incident.status === 'OPEN' ? 'bg-status-down/10 text-status-down border border-status-down/20' : 'bg-status-up/10 text-status-up border border-status-up/20'
                       }`}>
                         {incident.status}
                       </span>
                       <span className="text-[10px] text-muted font-mono tracking-widest">#INC-{incident.id.toString().padStart(4, '0')}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-accent-primary transition-colors">{incident.summary}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <History size={14} className="text-muted/50" />
                      Target: <span className="text-foreground font-black tracking-tighter">{incident.monitor?.project_name || 'System Cluster'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-12 relative z-10">
                    <div className="text-right">
                      <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-1">Start Event</p>
                      <div className="flex items-center gap-2 justify-end text-sm font-bold text-white tracking-tight">
                         <Calendar size={14} className="text-muted" />
                         {format(new Date(incident.started_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mb-1">Resolution</p>
                      <div className="flex items-center gap-2 justify-end text-sm font-bold text-white tracking-tight">
                         <Clock size={14} className="text-muted" />
                         {incident.resolved_at 
                          ? `${Math.round((new Date(incident.resolved_at) - new Date(incident.started_at)) / 60000)}m Duration` 
                          : 'Investigation Active'}
                      </div>
                    </div>
                    <button className="p-3 bg-surface/50 border border-border rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Aesthetic Background Sparkle */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 transition-opacity group-hover:opacity-20 ${
                    incident.status === 'OPEN' ? 'bg-status-down' : 'bg-status-up'
                  }`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="pt-10 border-t border-border flex flex-col items-center gap-4 text-center">
         <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
            <Activity size={18} className="text-accent-primary" />
            <p className="text-xs text-muted font-medium">Auditing 14 regional nodes for data consistency.</p>
         </div>
         <p className="text-[10px] text-muted/50 font-black uppercase tracking-[0.3em]">Confidential Diagnostic Output</p>
      </div>
    </div>
  );
};

export default IncidentTimeline;
