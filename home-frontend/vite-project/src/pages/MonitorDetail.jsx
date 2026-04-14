import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Activity, Clock, Globe, Zap, 
  ArrowLeft, ExternalLink, RefreshCw, 
  ShieldCheck, AlertTriangle, BarChart3,
  History, Calendar
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const MonitorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [monitor, setMonitor] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [monRes, logsRes] = await Promise.all([
        api.get(`/monitors/${id}`),
        api.get(`/monitors/${id}/logs?limit=50`)
      ]);
      setMonitor(monRes.data);
      setLogs(logsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch monitor detail', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted animate-pulse">Deep-Scan in Progress...</p>
    </div>
  );

  // Mock data for 24h uptime visualization
  const uptimeBlocks = Array(24).fill(0).map(() => Math.random() > 0.1 ? 'up' : 'warn');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* BREADCRUMB / ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-all w-fit group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Console</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-border rounded-lg">
             <div className={`w-2 h-2 rounded-full ${monitor.status === 'UP' ? 'bg-status-up shadow-[0_0_10px_#22C55E]' : 'bg-status-down animate-pulse'}`}></div>
             <span className="text-[10px] font-black uppercase text-white tracking-widest">{monitor.status === 'UP' ? 'Live' : 'Degraded'}</span>
          </div>
          <button className="secondary-button !py-1.5 text-[10px] uppercase tracking-widest">Edit Node</button>
        </div>
      </div>

      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card !p-10 border-accent-primary/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-[20px] bg-accent-primary flex items-center justify-center text-3xl font-black text-white shadow-accent-glow">
                 {monitor.project_name[0]}
               </div>
               <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter">{monitor.project_name}</h1>
                  <a href={monitor.url} target="_blank" rel="noreferrer" className="text-sm font-mono text-muted hover:text-accent-primary flex items-center gap-2 transition-colors mt-1">
                    {monitor.url}
                    <ExternalLink size={14} />
                  </a>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
               {[
                 { label: 'Uptime (30d)', val: '99.98%', icon: ShieldCheck },
                 { label: 'Avg Latency', val: `${monitor.last_response_time || 0}ms`, icon: Activity },
                 { label: 'Poll Frequency', val: monitor.frequency, icon: Clock },
               ].map((stat, i) => (
                 <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                    <stat.icon size={14} className="text-accent-primary" />
                    <span className="text-[10px] font-black uppercase text-muted tracking-widest">{stat.label}:</span>
                    <span className="text-xs font-bold text-white uppercase tracking-tight">{stat.val}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="text-[10px] font-black text-muted uppercase tracking-widest">Deployment Origin</p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border">
               <Globe size={16} className="text-indigo-400" />
               <span className="text-xs font-bold text-white uppercase tracking-tight">US-East (Virginia)</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN ANALYTICS */}
        <div className="lg:col-span-2 space-y-8">
           {/* LATENCY CHART */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass-card h-[400px] flex flex-col"
           >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <BarChart3 size={16} className="text-accent-primary" />
                    Response Time Profile
                 </h3>
                 <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Last 50 Samples</span>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={logs.slice().reverse()}>
                    <defs>
                      <linearGradient id="colorLatencyDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis 
                       dataKey="timestamp" 
                       hide 
                    />
                    <YAxis 
                       stroke="#4B5563" 
                       fontSize={10} 
                       tickFormatter={(val) => `${val}ms`}
                       axisLine={false}
                       tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px' }}
                      labelFormatter={(ts) => format(new Date(ts), 'HH:mm:ss')}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="response_time" 
                      stroke="#6366F1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLatencyDetail)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </motion.div>

           {/* UPTIME HISTORY */}
           <div className="glass-card">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <History size={16} className="text-status-up" />
                    24h Uptime Continuity
                 </h3>
                 <span className="text-[10px] font-bold text-status-up uppercase tracking-widest">100.0% Integrity</span>
              </div>
              <div className="flex gap-1.5 h-12">
                 {uptimeBlocks.map((status, i) => (
                   <div 
                     key={i} 
                     className={`flex-1 rounded-sm transition-all hover:scale-110 cursor-help ${
                       status === 'up' ? 'bg-status-up/40 hover:bg-status-up' : 'bg-status-warn/40 hover:bg-status-warn'
                     }`}
                     title={`Hour ${i}: Systems Healthy`}
                   ></div>
                 ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-black text-muted uppercase tracking-widest">
                 <span>24 Hours Ago</span>
                 <span>Present</span>
              </div>
           </div>
        </div>

        {/* LOGS FEED */}
        <div className="space-y-6">
           <div className="glass-card flex flex-col h-full max-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <RefreshCw size={14} className="text-accent-primary" />
                    Execution Logs
                 </h3>
                 <History size={16} className="text-muted" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {logs.map((log) => (
                   <div key={log.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                           log.status === 'UP' ? 'bg-status-up/10 text-status-up' : 'bg-status-down/10 text-status-down'
                         }`}>
                           {log.status === 'UP' ? 'Success' : 'Failure'}
                         </span>
                         <span className="text-[10px] font-mono text-muted">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                      </div>
                      <div className="flex items-end justify-between">
                         <p className="text-xs text-foreground font-mono truncate max-w-[120px]">{log.response_time}ms</p>
                         <div className="text-[10px] text-muted font-bold tracking-tighter italic">Checked via Engine-01</div>
                      </div>
                   </div>
                 ))}
                 {logs.length === 0 && (
                   <div className="py-20 text-center text-muted text-xs font-medium space-y-4">
                      <History size={32} className="mx-auto opacity-20" />
                      <p>No telemetry recorded yet.</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
              <Zap className="text-indigo-400 shrink-0" size={24} />
              <div>
                 <p className="text-xs font-bold text-white mb-1 uppercase tracking-tight leading-none italic underline underline-offset-4 decoration-indigo-500/30">AI Analysis Active</p>
                 <p className="text-[10px] text-muted leading-relaxed">
                   H.O.M.E is processing edge signals to identify dormant patterns.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorDetail;
