import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Globe, Zap, Clock, 
  ArrowUpRight, ArrowDownRight, 
  Search, Filter, RefreshCcw, MoreVertical, X,
  ShieldCheck, AlertTriangle, CheckCircle2, MessageSquare
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
  const [explainingMonitor, setExplainingMonitor] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [explainLoading, setExplainLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMonitors = async () => {
    try {
      if (localStorage.getItem('token') === 'demo-token') {
        // Mock data for demo mode
        setMonitors([
          { id: 1, project_name: 'Main Website', url: 'https://home.ai', status: 'UP', last_response_time: 120 },
          { id: 2, project_name: 'API Server', url: 'https://api.home.ai', status: 'UP', last_response_time: 85 },
          { id: 3, project_name: 'Blog', url: 'https://blog.home.ai', status: 'DOWN', last_response_time: null }
        ]);
        setLoading(false);
        return;
      }
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
      if (localStorage.getItem('token') === 'demo-token') {
        setTimeout(() => {
          setExplanation("Your website is experiencing a temporary SSL certificate issue. I recommend checking your domain registrar's DNS settings.");
          setExplainLoading(false);
        }, 1500);
        return;
      }
      const response = await api.get(`/ai/explain/${monitorId}`);
      setExplanation(response.data.response);
    } catch (err) {
      setExplanation("I'm sorry, I couldn't connect to the AI service right now. Please try again later.");
    } finally {
      if (localStorage.getItem('token') !== 'demo-token') setExplainLoading(false);
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
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium animate-pulse">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Overall Uptime', value: stats.total ? `${Math.round((stats.up/stats.total)*100)}%` : '0%', icon: Globe, color: 'text-indigo-500 bg-indigo-50 border-indigo-100', trend: '+1.2%', up: true },
          { label: 'Websites Online', value: stats.up, icon: Activity, color: 'text-emerald-500 bg-emerald-50 border-emerald-100', trend: 'Healthy', up: true },
          { label: 'Issues Detected', value: stats.down, icon: Zap, color: 'text-red-500 bg-red-50 border-red-100', trend: stats.down > 0 ? '+1' : 'None', up: stats.down === 0 },
          { label: 'Avg Response Time', value: `${stats.avgLatency}ms`, icon: Clock, color: 'text-purple-500 bg-purple-50 border-purple-100', trend: '-8ms', up: true },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="glass-card"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                stat.up ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
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
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-accent-primary" />
              Response Time
            </h3>
            <div className="flex gap-2">
               {['5m', '1h', '24h'].map(t => (
                 <button key={t} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${t === '1h' ? 'bg-white border-gray-300 text-gray-900 shadow-sm' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>{t}</button>
               ))}
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: '600' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#4F46E5" 
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
            <h3 className="text-sm font-bold text-gray-900">Activity Feed</h3>
            <button className="text-xs font-semibold text-accent-primary hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {[
              { msg: 'Website check complete', time: '2m ago', type: 'info' },
              { msg: 'Slight delay in response from Blog', time: '14m ago', type: 'warn' },
              { msg: 'Weekly report generated', time: '1h ago', type: 'info' },
              { msg: 'Scheduled maintenance started', time: '3h ago', type: 'info' },
            ].map((ev, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ev.type === 'warn' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                <div>
                   <p className="text-sm text-gray-800 font-medium">{ev.msg}</p>
                   <p className="text-xs text-gray-500 mt-1">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate('/setup')}
            className="premium-button w-full mt-6 py-3"
          >
            <RefreshCcw size={16} />
            Add New Website
          </button>
        </motion.div>
      </div>

      {/* MONITOR TABLE */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3 }}
         className="overflow-hidden rounded-premium border border-gray-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Website Name</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
              {monitors.map((m) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={m.id} 
                  className="hover:bg-gray-50 transition-all cursor-pointer group"
                  onClick={() => navigate(`/monitor/${m.id}`)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-accent-primary font-bold shadow-sm">
                        {m.project_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-accent-primary transition-colors tracking-tight">{m.project_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{m.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 font-mono text-sm font-semibold">
                      <span className={m.last_response_time > 500 ? 'text-amber-500' : 'text-gray-900'}>
                        {m.last_response_time ? `${m.last_response_time}ms` : '--'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 text-gray-400">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleExplain(m.id); }}
                        className="p-2.5 hover:bg-indigo-50 rounded-xl text-indigo-500 transition-colors"
                        title="Ask AI about this site"
                      >
                        <MessageSquare size={18} />
                      </button>
                      <button className="p-2.5 hover:bg-gray-100 rounded-xl hover:text-gray-900 transition-colors">
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

      {/* AI MODAL */}
      <AnimatePresence>
      {explainingMonitor && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-accent-primary">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">AI Assistant</h3>
                  <p className="text-xs text-gray-500 font-medium">Analyzing {explainingMonitor.project_name}</p>
                </div>
              </div>
              <button onClick={() => setExplainingMonitor(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6">
                {explainLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-100 border-t-accent-primary rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 font-medium animate-pulse">Checking website vitals...</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative">
                    <div className="absolute -top-3 left-6 bg-white px-2">
                       <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 size={14} /> Analysis Complete
                       </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm pt-2">{explanation}</p>
                  </div>
                )}
            </div>
            
            {!explainLoading && (
              <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50/50">
                <button onClick={() => setExplainingMonitor(null)} className="premium-button px-6">Got it</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;