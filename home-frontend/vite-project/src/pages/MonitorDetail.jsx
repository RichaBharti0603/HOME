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
      if (localStorage.getItem('token') === 'demo-token') {
        // Mock data
        setMonitor({ id, project_name: 'Main Website', url: 'https://home.ai', status: 'UP', last_response_time: 120, frequency: '1m' });
        setLogs([
          { id: 1, status: 'UP', timestamp: new Date().toISOString(), response_time: 120 },
          { id: 2, status: 'UP', timestamp: new Date(Date.now() - 60000).toISOString(), response_time: 115 },
          { id: 3, status: 'UP', timestamp: new Date(Date.now() - 120000).toISOString(), response_time: 130 },
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

    // WebSocket Setup
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'localhost:8000';
    // Remove protocol for host string if present
    const host = apiBaseUrl.replace(/^https?:\/\//, '');
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${host}/ws?monitor_id=${id}`;

    let socket;
    try {
      socket = new WebSocket(wsUrl);
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'status_update' && data.monitor_id == id) {
          setMonitor(prev => ({ ...prev, status: data.status, last_response_time: data.last_response_time }));
          // Refresh logs when we get an update
          api.get(`/monitors/${id}/logs?limit=50`).then(res => setLogs(res.data));
        }
      };

      socket.onerror = (err) => console.error('WebSocket Error:', err);
    } catch (err) {
      console.error('WebSocket connection failed', err);
    }

    // Polling as a fallback (less frequent)
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(interval);
      if (socket) socket.close();
    };
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading website details...</p>
    </div>
  );

  // Mock data for 24h uptime visualization
  const uptimeBlocks = Array(24).fill(0).map(() => Math.random() > 0.05 ? 'up' : 'warn');

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* BREADCRUMB / ACTIONS */}
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
          <button className="px-4 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all">Edit Settings</button>
        </div>
      </div>

      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-5">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl font-bold text-accent-primary border border-indigo-100 shadow-sm">
                 {monitor.project_name[0]}
               </div>
               <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{monitor.project_name}</h1>
                  <a href={monitor.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-500 hover:text-accent-primary flex items-center gap-1.5 transition-colors mt-1">
                    {monitor.url}
                    <ExternalLink size={14} />
                  </a>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2">
               {[
                 { label: 'Uptime (30d)', val: '99.98%', icon: ShieldCheck, color: 'text-emerald-600' },
                 { label: 'Avg Latency', val: `${monitor.last_response_time || 0}ms`, icon: Activity, color: 'text-indigo-600' },
                 { label: 'Poll Frequency', val: monitor.frequency || '1m', icon: Clock, color: 'text-gray-600' },
               ].map((stat, i) => (
                 <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                    <stat.icon size={16} className={stat.color} />
                    <span className="text-xs font-semibold text-gray-500">{stat.label}:</span>
                    <span className="text-sm font-bold text-gray-900">{stat.val}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monitored From</p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
               <Globe size={18} className="text-indigo-500" />
               <span className="text-sm font-bold text-gray-800">US-East (Virginia)</span>
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
             className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm h-[400px] flex flex-col"
           >
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 size={18} className="text-accent-primary" />
                    Response Time History
                 </h3>
                 <span className="text-xs font-semibold text-gray-500">Last 50 Checks</span>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={logs.slice().reverse()}>
                    <defs>
                      <linearGradient id="colorLatencyDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis 
                       dataKey="timestamp" 
                       hide 
                    />
                    <YAxis 
                       stroke="#9CA3AF" 
                       fontSize={12} 
                       tickFormatter={(val) => `${val}ms`}
                       axisLine={false}
                       tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      labelFormatter={(ts) => format(new Date(ts), 'HH:mm:ss')}
                      itemStyle={{ color: '#111827', fontWeight: '600' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="response_time" 
                      stroke="#4F46E5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLatencyDetail)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </motion.div>

           {/* UPTIME HISTORY */}
           <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <History size={18} className="text-emerald-500" />
                    24-Hour Uptime
                 </h3>
                 <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">100.0% Uptime</span>
              </div>
              <div className="flex gap-1.5 h-14">
                 {uptimeBlocks.map((status, i) => (
                   <div 
                     key={i} 
                     className={`flex-1 rounded-md transition-all hover:-translate-y-1 cursor-help ${
                       status === 'up' ? 'bg-emerald-400 hover:bg-emerald-500' : 'bg-amber-400 hover:bg-amber-500'
                     }`}
                     title={`Hour ${i}: Systems Healthy`}
                   ></div>
                 ))}
              </div>
              <div className="flex justify-between mt-3 text-xs font-semibold text-gray-400">
                 <span>24 Hours Ago</span>
                 <span>Present</span>
              </div>
           </div>
        </div>

        {/* LOGS FEED */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col h-full max-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <RefreshCw size={16} className="text-accent-primary" />
                    Recent Checks
                 </h3>
                 <History size={18} className="text-gray-400" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                 {logs.map((log) => (
                   <div key={log.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                         <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                           log.status === 'UP' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                         }`}>
                           {log.status === 'UP' ? 'Success' : 'Failure'}
                         </span>
                         <span className="text-xs font-medium text-gray-500">{format(new Date(log.timestamp), 'h:mm:ss a')}</span>
                      </div>
                      <div className="flex items-end justify-between mt-3">
                         <p className="text-sm font-bold text-gray-800 font-mono">{log.response_time}ms</p>
                         <div className="text-xs text-gray-400 font-medium">Checked via US-East</div>
                      </div>
                   </div>
                 ))}
                 {logs.length === 0 && (
                   <div className="py-20 text-center text-gray-400 text-sm font-medium space-y-4">
                      <History size={32} className="mx-auto opacity-30" />
                      <p>No checks recorded yet.</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
              <Zap className="text-accent-primary shrink-0 mt-0.5" size={20} />
              <div>
                 <p className="text-sm font-bold text-gray-900 mb-1">Smart Alerts Active</p>
                 <p className="text-xs text-gray-600 leading-relaxed font-medium">
                   We'll automatically notify you if response times spike or if the site goes offline.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MonitorDetail;
