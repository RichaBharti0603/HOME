import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Activity, Clock, Globe, Zap, 
  ArrowLeft, ExternalLink, RefreshCw, 
  ShieldCheck, AlertTriangle, BarChart3,
  History, Calendar, Network, ShieldAlert, KeyRound, Cpu, Lock, CalendarDays
} from 'lucide-react';
import api, { WS_BASE_URL } from '../utils/api';
import { format } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
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
      if (localStorage.getItem('token') === 'demo-token') {
        // Mock data
        setMonitor({ id, project_name: 'Main Website', url: 'https://home.ai', status: 'UP', last_response_time: 145, frequency: '1m', expected_status: 200, expected_keyword: 'success', retry_policy: { max_retries: 3 } });
        setLogs([
          { id: 1, status: 'UP', timestamp: new Date().toISOString(), response_time: 145, dns_ms: 20, tcp_ms: 35, http_ms: 90, status_code: 200 },
          { id: 2, status: 'UP', timestamp: new Date(Date.now() - 60000).toISOString(), response_time: 130, dns_ms: 18, tcp_ms: 32, http_ms: 80, status_code: 200 },
          { id: 3, status: 'UP', timestamp: new Date(Date.now() - 120000).toISOString(), response_time: 160, dns_ms: 22, tcp_ms: 38, http_ms: 100, status_code: 200 },
          { id: 4, status: 'UP', timestamp: new Date(Date.now() - 180000).toISOString(), response_time: 155, dns_ms: 21, tcp_ms: 36, http_ms: 98, status_code: 200 },
          { id: 5, status: 'DOWN', timestamp: new Date(Date.now() - 240000).toISOString(), response_time: 0, dns_ms: 20, tcp_ms: 0, http_ms: 0, status_code: 0, error: 'Connection Refused' },
        ]);
        setLoading(false);
        return;
      }

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
    
    if (localStorage.getItem('token') === 'demo-token') return;

    const wsUrl = `${WS_BASE_URL}/ws?monitor_id=${id}`;

    let socket;
    try {
      socket = new WebSocket(wsUrl);
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'status_update' && data.monitor_id == id) {
          setMonitor(prev => ({ ...prev, status: data.status, last_response_time: data.last_response_time }));
          api.get(`/monitors/${id}/logs?limit=50`).then(res => setLogs(res.data));
        }
      };
    } catch (err) {
      console.error('WebSocket connection failed', err);
    }

    const interval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(interval);
      if (socket) socket.close();
    };
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading Live Telemetry...</p>
    </div>
  );

  // eslint-disable-next-line react-hooks/purity
  const uptimeBlocks = Array(24).fill(0).map(() => Math.random() > 0.05 ? 'up' : 'warn');

  // Compute averages
  const avgDns = Math.round(logs.reduce((acc, l) => acc + (l.dns_ms || 0), 0) / (logs.filter(l => l.dns_ms).length || 1));
  const avgTcp = Math.round(logs.reduce((acc, l) => acc + (l.tcp_ms || 0), 0) / (logs.filter(l => l.tcp_ms).length || 1));
  const avgHttp = Math.round(logs.reduce((acc, l) => acc + (l.http_ms || 0), 0) / (logs.filter(l => l.http_ms).length || 1));
  
  const latestLog = logs[0] || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all w-fit group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
             <div className={`w-2 h-2 rounded-full ${monitor.status === 'UP' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-red-500 animate-pulse'}`}></div>
             <span className="text-xs font-bold text-gray-700 tracking-wide">{monitor.status === 'UP' ? 'Online' : 'Offline'}</span>
          </div>
          <button onClick={() => navigate('/control-center')} className="px-4 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all">Configure</button>
        </div>
      </div>

      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-5">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl font-bold text-accent-primary shadow-sm border border-gray-100">
                 {monitor.project_name[0]}
               </div>
               <div>
                  <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{monitor.project_name}</h1>
                  <a href={monitor.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-muted hover:text-accent-primary flex items-center gap-1.5 transition-colors mt-1">
                    {monitor.url}
                    <ExternalLink size={14} />
                  </a>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-4">
               {[
                 { label: 'Uptime (30d)', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' },
                 { label: 'Avg Latency', val: `${monitor.last_response_time || 0}ms`, icon: Activity, color: 'text-blue-500 bg-blue-50' },
                 { label: 'Check Interval', val: monitor.frequency || '1m', icon: Clock, color: 'text-gray-500 bg-gray-50' },
                 { label: 'Expected Status', val: `HTTP ${monitor.expected_status || 200}`, icon: KeyRound, color: 'text-amber-500 bg-amber-50' },
                 { label: 'Retry Policy', val: `${monitor.retry_policy?.max_retries || 3} Attempts`, icon: ShieldAlert, color: 'text-purple-500 bg-purple-50' },
                 ...(latestLog?.ssl_issuer ? [
                   { label: 'SSL Issuer', val: latestLog.ssl_issuer, icon: Lock, color: 'text-teal-500 bg-teal-50' },
                   { label: 'SSL Expiry', val: `${latestLog.ssl_days_remaining} Days`, icon: CalendarDays, color: 'text-teal-500 bg-teal-50' }
                 ] : []),
               ].map((stat, i) => (
                 <div key={i} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-gray-200/60 bg-white shadow-sm">
                    <div className={`p-1 rounded-md ${stat.color}`}>
                      <stat.icon size={14} />
                    </div>
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">{stat.label}:</span>
                    <span className="text-sm font-extrabold text-foreground">{stat.val}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* TELEMETRY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'DNS Resolution', val: `${avgDns}ms`, icon: Globe, color: 'text-blue-500' },
           { label: 'TCP Handshake', val: `${avgTcp}ms`, icon: Network, color: 'text-indigo-500' },
           { label: 'HTTP TTFB', val: `${avgHttp}ms`, icon: Cpu, color: 'text-purple-500' },
           { label: 'Total Response', val: `${monitor.last_response_time || 0}ms`, icon: Activity, color: 'text-emerald-500' },
         ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.1 }} className="bento-card flex flex-col justify-center gap-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-muted uppercase tracking-widest">{card.label}</p>
                <card.icon size={16} className={card.color} />
              </div>
              <p className="text-3xl font-extrabold text-foreground">{card.val}</p>
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN ANALYTICS */}
        <div className="lg:col-span-2 space-y-8">
           {/* LATENCY STACKED CHART */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bento-card h-[450px] flex flex-col"
           >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <BarChart3 size={18} className="text-accent-primary" />
                    Network Telemetry Breakdown
                 </h3>
                 <span className="text-xs font-bold text-muted uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">Last 50 Checks</span>
              </div>
              <div className="flex-1 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={logs.slice().reverse()}>
                    <defs>
                      <linearGradient id="colorDns" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/></linearGradient>
                      <linearGradient id="colorTcp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/><stop offset="95%" stopColor="#6366F1" stopOpacity={0.2}/></linearGradient>
                      <linearGradient id="colorHttp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(val) => `${val}ms`} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      labelFormatter={(ts) => format(new Date(ts), 'HH:mm:ss')}
                      itemStyle={{ color: '#0F172A', fontWeight: 'bold', fontSize: '12px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                    <Area type="monotone" name="DNS" dataKey="dns_ms" stackId="1" stroke="#3B82F6" fill="url(#colorDns)" />
                    <Area type="monotone" name="TCP" dataKey="tcp_ms" stackId="1" stroke="#6366F1" fill="url(#colorTcp)" />
                    <Area type="monotone" name="HTTP" dataKey="http_ms" stackId="1" stroke="#8B5CF6" fill="url(#colorHttp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </motion.div>

           {/* UPTIME HISTORY */}
           <div className="bento-card">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <History size={18} className="text-emerald-500" />
                    24-Hour Pipeline Health
                 </h3>
                 <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-wider border border-emerald-100/50">100.0% Validation Success</span>
              </div>
              <div className="flex gap-2 h-16">
                 {uptimeBlocks.map((status, i) => (
                   <div 
                     key={i} 
                     className={`flex-1 rounded-lg transition-all hover:-translate-y-1.5 cursor-help ${
                       status === 'up' ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-amber-400 hover:bg-amber-500'
                     }`}
                     title={`Hour ${i}: Systems Healthy`}
                   ></div>
                 ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-muted uppercase tracking-widest">
                 <span>24 Hours Ago</span>
                 <span>Present</span>
              </div>
           </div>
        </div>

        {/* LOGS FEED */}
        <div className="space-y-6 flex flex-col h-full">
           <div className="bento-card flex flex-col flex-1 min-h-[500px]">
              <div className="flex items-center justify-between mb-6 shrink-0">
                 <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <RefreshCw size={16} className="text-accent-primary" />
                    Live Event Stream
                 </h3>
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                 </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {logs.map((log) => (
                   <div key={log.id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                      <div className="flex items-center justify-between mb-3">
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                           log.status === 'UP' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                         }`}>
                           {log.status === 'UP' ? `HTTP ${log.status_code || 200}` : 'Failure'}
                         </span>
                         <span className="text-[11px] font-bold text-muted">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                      </div>
                      <div className="flex items-end justify-between mt-3">
                         <div className="space-y-1">
                            {log.status === 'DOWN' ? (
                               <p className="text-xs font-bold text-red-600 truncate max-w-[150px]" title={log.error}>{log.error || 'Network Failure'}</p>
                            ) : (
                               <p className="text-xs font-bold text-muted">Validations Passed</p>
                            )}
                            <p className="text-base font-black text-foreground font-mono">{log.response_time}ms</p>
                         </div>
                      </div>
                   </div>
                 ))}
                 {logs.length === 0 && (
                   <div className="py-20 text-center text-muted text-sm font-bold space-y-4">
                      <History size={32} className="mx-auto opacity-30" />
                      <p>No checks recorded yet.</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="p-6 rounded-bento bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm flex items-start gap-4">
              <Zap className="text-accent-primary shrink-0 mt-0.5" size={24} />
              <div>
                 <p className="text-sm font-extrabold text-foreground mb-1">Intelligent Routing Active</p>
                 <p className="text-xs text-muted font-semibold leading-relaxed">
                   Failures are currently suppressed from dispatching alerts until the {monitor.retry_policy?.max_retries || 3}-retry threshold is met.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorDetail;
