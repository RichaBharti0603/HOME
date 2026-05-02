import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, ShieldCheck, Clock, 
  ChevronRight, Filter, Search, Activity,
  Calendar, CheckCircle2, History, AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const IncidentTimeline = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchIncidents = async () => {
    try {
      if (localStorage.getItem('token') === 'demo-token') {
        setIncidents([
          { 
             id: 1042, 
             status: 'RESOLVED', 
             severity: 'HIGH',
             summary: 'Elevated latency on Main Website', 
             monitor: { project_name: 'Main Website' },
             started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
             resolved_at: new Date(Date.now() - 86400000 * 2 + 1200000).toISOString(),
             root_cause: 'Database connection timeout due to connection pool exhaustion.'
          },
          { 
             id: 1043, 
             status: 'OPEN', 
             severity: 'CRITICAL',
             summary: 'Connection timeout', 
             monitor: { project_name: 'API Server' },
             started_at: new Date(Date.now() - 86400000 * 0.1).toISOString(),
             resolved_at: null,
             root_cause: 'Network partition preventing TCP handshake.'
          },
          { 
             id: 1044, 
             status: 'RESOLVED', 
             severity: 'MEDIUM',
             summary: 'Keyword Validation Failure', 
             monitor: { project_name: 'Blog' },
             started_at: new Date(Date.now() - 86400000 * 5).toISOString(),
             resolved_at: new Date(Date.now() - 86400000 * 5 + 300000).toISOString(),
             root_cause: 'Expected keyword "Latest Posts" not found in response body.'
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

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchesSearch = inc.summary?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inc.monitor?.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' ? true : inc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [incidents, searchTerm, statusFilter]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading incident history...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Event Store</h1>
          <p className="text-muted font-medium text-sm">A complete operational log of system outages, root causes, and recovery events.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-pill">
           <ShieldCheck size={18} className="text-emerald-600" />
           <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">Secure Ledger</span>
        </div>
      </header>

      {/* FILTER & SEARCH BAR */}
      <div className="bento-card !py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by website or incident..." 
            className="w-full pl-12 pr-4 py-2.5 bg-background border border-border/80 rounded-pill text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select 
            className="bg-gray-50 border border-gray-200 rounded-xl text-sm py-2.5 px-4 focus:outline-none w-full md:w-auto"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Active Incidents</option>
            <option value="RESOLVED">Resolved Incidents</option>
          </select>
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bento-card p-16 md:p-24 text-center flex flex-col items-center gap-6"
        >
          <div className="p-6 rounded-bento bg-emerald-50 text-emerald-500 border border-emerald-100">
            <ShieldCheck size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground tracking-tight">No Events Found</h3>
            <p className="text-muted font-medium max-w-sm mx-auto">Try adjusting your filters, or enjoy the fact that your systems are completely healthy.</p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident, idx) => (
            <motion.div 
              key={incident.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface rounded-bento border border-border/80 shadow-premium overflow-hidden group hover:shadow-floating hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-stretch min-h-[120px]">
                <div className={`w-2 ${incident.status === 'OPEN' ? 'bg-red-500 shadow-[2px_0_10px_#EF4444]' : 'bg-emerald-500'}`}></div>
                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Left Section: Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                       <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                         incident.status === 'OPEN' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                       }`}>
                         {incident.status === 'OPEN' ? 'Active Incident' : 'Resolved'}
                       </span>
                       <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                          incident.severity === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-700' :
                          incident.severity === 'HIGH' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                          'bg-amber-50 border-amber-200 text-amber-700'
                       }`}>
                         {incident.severity || 'UNKNOWN'}
                       </span>
                       <span className="text-xs text-gray-400 font-mono font-medium">#INC-{incident.id.toString().padStart(4, '0')}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-accent-primary transition-colors">{incident.summary}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <History size={16} className="text-gray-400" />
                        <span className="text-gray-900 font-semibold">{incident.monitor?.project_name || 'System Cluster'}</span>
                      </div>
                      {incident.root_cause && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 max-w-sm truncate" title={incident.root_cause}>
                          <AlertCircle size={14} className="text-gray-400" />
                          <span className="text-xs font-medium truncate">{incident.root_cause}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Time */}
                  <div className="flex items-center gap-6 md:gap-10 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-8">
                    <div className="text-left md:text-right">
                      <p className="text-[11px] text-muted font-bold uppercase tracking-wider mb-1">Started At</p>
                      <div className="flex items-center gap-2 md:justify-end text-sm font-bold text-foreground">
                         <Calendar size={16} className="text-muted" />
                         {format(new Date(incident.started_at), 'MMM d, HH:mm')}
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[11px] text-muted font-bold uppercase tracking-wider mb-1">Duration</p>
                      <div className="flex items-center gap-2 md:justify-end text-sm font-bold text-foreground">
                         <Clock size={16} className="text-muted" />
                         {incident.resolved_at 
                          ? `${Math.max(1, Math.round((new Date(incident.resolved_at) - new Date(incident.started_at)) / 60000))}m` 
                          : 'Ongoing'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           fetch('http://localhost:9000/chat', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ message: `Analyze incident #${incident.id} for project ${incident.monitor?.project_name || 'System Cluster'}: ${incident.summary}. Known root cause: ${incident.root_cause || 'unknown'}. What actions should I take locally?` })
                           }).then(() => alert('Incident sent to Local AI. Open Local Control Center (http://localhost:9000) to view analysis.')).catch(() => alert('Failed to contact Local AI. Is it running?'));
                        }}
                        className="hidden lg:flex items-center gap-2 p-2.5 px-4 bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all text-xs whitespace-nowrap"
                      >
                        <ShieldCheck size={14} /> Analyze Locally
                      </button>
                      <button className="hidden md:flex p-3 bg-background border border-border/80 rounded-xl text-muted hover:text-accent-primary hover:bg-indigo-50 transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentTimeline;
