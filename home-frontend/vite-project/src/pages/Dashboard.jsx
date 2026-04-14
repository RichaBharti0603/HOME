import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Globe, Zap, Clock, 
  ArrowUpRight, ArrowDownRight, 
  Search, Filter, RefreshCcw, MoreVertical, X,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [explainingMonitor, setExplainingMonitor] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMonitors = async () => {
    try {
      const response = await api.get('/monitors');
      setMonitors(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch monitors', err);
    }
  };

  const handleExplain = async (monitorId) => {
    const monitor = monitors.find(m => m.id === monitorId);
    setExplainingMonitor(monitor);
    setExplainLoading(true);
    setExplanation('');
    try {
      const response = await api.get(`/ai/explain/${monitorId}`);
      setExplanation(response.data.response);
    } catch (err) {
      setExplanation("The H.O.M.E intelligence engine is currently unavailable. Please try again later.");
    } finally {
      setExplainLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 10000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: monitors.length,
    up: monitors.filter(m => m.status === 'UP').length,
    down: monitors.filter(m => m.status === 'DOWN').length,
    avgLatency: monitors.length ? 
      Math.round(monitors.reduce((acc, m) => acc + (m.last_response_time || 0), 0) / monitors.length) : 0
  };

  const chartData = [
    { time: '10:00', latency: 45 },
    { time: '10:05', latency: 52 },
    { time: '10:10', latency: 78 },
    { time: '10:15', latency: 61 },
    { time: '10:20', latency: 55 },
    { time: '10:25', latency: 42 },
    { time: '10:30', latency: 49 },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-muted animate-pulse font-bold tracking-widest uppercase text-[10px]">Syncing Engine...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Uptime Score', value: stats.total ? `${Math.round((stats.up/stats.total)*100)}%` : '0%', icon: Globe, color: 'text-blue-500', trend: '+1.2%', up: true },
          { label: 'Active Targets', value: stats.up, icon: Activity, color: 'text-green-500', trend: 'Healthy', up: true },
          { label: 'Incident Queue', value: stats.down, icon: Zap, color: 'text-red-500', trend: stats.down > 0 ? '+1' : 'None', up: stats.down === 0 },
          { label: 'Avg Latency', value: `${stats.avgLatency}ms`, icon: Clock, color: 'text-purple-500', trend: '-8ms', up: true },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="glass-card group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-background border border-border group-hover:border-accent-primary/30 transition-colors ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-lg ${
                stat.up ? 'bg-status-up/10 text-status-up' : 'bg-status-down/10 text-status-down'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <div className="text-4xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
              <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART SECTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity size={14} className="text-accent-primary" />
              Latency Pulse
            </h3>
            <div className="flex gap-2">
               {['5m', '1h', '24h'].map(t => (
                 <button key={t} className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${t === '1h' ? 'bg-accent-primary border-accent-primary text-white' : 'border-border text-muted hover:text-white'}`}>{t}</button>
               ))}
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#6366F1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLatency)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* FEED / QUICK SETUP */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Operational Feed</h3>
            <button className="text-[10px] font-bold text-accent-primary hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {[
              { msg: 'System check complete in US-East', time: '2m ago', type: 'info' },
              { msg: 'Latency spike on API Node A', time: '14m ago', type: 'warn' },
              { msg: 'New probe deployed in Frankfurt', time: '1h ago', type: 'info' },
              { msg: 'Postgres maintenance window set', time: '3h ago', type: 'info' },
            ].map((ev, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${ev.type === 'warn' ? 'bg-status-warn' : 'bg-accent-primary'}`}></div>
                <div>
                   <p className="text-xs text-foreground font-medium">{ev.msg}</p>
                   <p className="text-[10px] text-muted mt-1">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/setup')}
            className="premium-button w-full mt-6"
          >
            <RefreshCcw size={16} />
            Deploy New Node
          </button>
        </motion.div>
      </div>

      {/* MONITOR TABLE */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3 }}
         className="overflow-hidden rounded-premium border border-border bg-surface/30"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Deployment Target</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Response Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <AnimatePresence>
              {monitors.map((m) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={m.id} 
                  className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                  onClick={() => navigate(`/monitor/${m.id}`)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-accent-primary font-bold shadow-premium">
                        {m.project_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-accent-primary transition-colors tracking-tight">{m.project_name}</div>
                        <div className="text-[10px] text-muted font-mono truncate max-w-[200px] mt-0.5">{m.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-mono text-sm font-black">
                      <span className={m.last_response_time > 500 ? 'text-status-warn' : 'text-status-up'}>
                        {m.last_response_time ? `${m.last_response_time}ms` : '--'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 text-muted">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleExplain(m.id); }}
                        className="p-2.5 hover:bg-accent-primary/10 rounded-xl text-accent-primary transition-colors"
                      >
                        <Zap size={18} />
                      </button>
                      <button className="p-2.5 hover:bg-white/10 rounded-xl hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* AI MODAL (Minimal Redesign) */}
      <AnimatePresence>
      {explainingMonitor && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-2xl glass rounded-[24px] border border-accent-primary/20 shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-border bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-accent-primary rounded-xl text-white shadow-accent-glow">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">H.O.M.E Intelligence</h3>
                  <p className="text-[10px] text-muted font-bold tracking-widest uppercase">Diagnostic Engine • {explainingMonitor.project_name}</p>
                </div>
              </div>
              <button onClick={() => setExplainingMonitor(null)} className="p-2 hover:bg-white/10 rounded-full text-muted transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="p-6 bg-surface/40 rounded-2xl border border-white/5">
                {explainLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
                    <p className="text-[10px] text-muted font-black tracking-[0.2em] animate-pulse">Running Diagnostic Inference...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-foreground leading-relaxed font-medium">{explanation}</p>
                    <div className="flex items-center gap-2 text-[10px] text-accent-primary font-black uppercase tracking-widest bg-accent-primary/10 px-4 py-2 rounded-full w-fit">
                      <Zap size={12} /> Verification Complete
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 bg-white/[0.02] border-t border-border flex justify-end">
              <button onClick={() => setExplainingMonitor(null)} className="premium-button">Acknowledge</button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;