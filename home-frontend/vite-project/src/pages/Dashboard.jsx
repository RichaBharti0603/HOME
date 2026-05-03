import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Globe, Zap, Clock, 
  Search, RefreshCcw, MoreVertical, X,
  ShieldCheck, AlertTriangle, CheckCircle2, MessageSquare,
  ArrowUpRight, Sparkles, Send, BrainCircuit
} from 'lucide-react';
import api from '../utils/api';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  
  // Embedded Assistant State
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  const navigate = useNavigate();

  const fetchMonitors = async () => {
    try {
      if (localStorage.getItem('token') === 'demo-token') {
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
      
      try {
        const logsRes = await api.get('/monitors/all/logs?limit=30');
        const logs = logsRes.data.reverse();
        const cData = logs.map(l => ({
          time: new Date(l.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          latency: l.response_time || 0
        }));
        setChartData(cData.length ? cData : [
          { time: '10:00', latency: 0 }, { time: '10:05', latency: 0 }
        ]);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch monitors', err);
      setLoading(false);
    }
  };

  const handleAiQuery = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setAiLoading(true);
    try {
      if (localStorage.getItem('token') === 'demo-token') {
        setTimeout(() => {
          setAiResponse("Based on the recent logs, the Blog's downtime is likely caused by an SSL certificate validation failure. I recommend checking the certificate chain.");
          setAiLoading(false);
        }, 1500);
        return;
      }
      const response = await api.post('/ai/query', { query: aiInput });
      setAiResponse(response.data.response);
    } catch (err) {
      setAiResponse("Couldn't reach the AI engine. Please try again.");
    } finally {
      if (localStorage.getItem('token') !== 'demo-token') setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: monitors.length,
    up: monitors.filter(m => m.status === 'UP').length,
    down: monitors.filter(m => m.status === 'DOWN').length,
    uptimePercent: monitors.length ? Math.round((monitors.filter(m => m.status === 'UP').length / monitors.length) * 100) : 0,
    avgLatency: monitors.length ? Math.round(monitors.reduce((acc, m) => acc + (m.last_response_time || 0), 0) / monitors.length) : 0
  };



  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-muted font-medium animate-pulse">Initializing Mission Control...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION (Title + Huge Central Arc) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Title & Quick Stats */}
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Workspace</h1>
            <p className="text-muted font-medium text-sm">H.O.M.E active monitoring and telemetry pipeline.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bento-card p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                <Globe size={20} />
              </div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Endpoints</p>
              <h3 className="text-2xl font-extrabold text-foreground">{stats.total}</h3>
            </div>
            <div className="bento-card p-5 border-l-4 border-l-emerald-500">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Online</p>
              <h3 className="text-2xl font-extrabold text-foreground">{stats.up}</h3>
            </div>
          </div>
        </div>

        {/* Massive Uptime Arc (Reference 1 Inspiration) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bento-card relative overflow-hidden flex flex-col items-center justify-center min-h-[250px] bg-gradient-to-br from-white to-gray-50"
        >
          {/* Decorative Arc/Gradient */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none opacity-30">
             <div className="w-full h-full rounded-[100%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-primary/20 via-white to-transparent"></div>
          </div>
          
          <div className="relative z-10 text-center space-y-2 mt-4">
            <p className="text-sm font-bold text-muted uppercase tracking-widest">System Availability</p>
            <div className="flex items-baseline justify-center gap-2">
              <h1 className="text-7xl font-black text-foreground tracking-tighter" style={{ fontFeatureSettings: '"tnum"' }}>
                {stats.uptimePercent}
              </h1>
              <span className="text-4xl font-bold text-muted">%</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-4 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full mx-auto w-fit">
               <ArrowUpRight size={16} className="text-emerald-500" />
               <span className="text-xs font-bold text-emerald-700 tracking-wide">+0.04% vs Last Week</span>
            </div>
          </div>

          {/* Connected nodes decorative */}
          <div className="absolute top-1/2 left-10 w-2 h-2 rounded-full bg-accent-primary shadow-[0_0_10px_#3B82F6] hidden md:block"></div>
          <div className="absolute bottom-1/4 right-16 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818CF8] hidden md:block"></div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 hidden md:block" strokeDasharray="4 4" stroke="#CBD5E1">
             <path d="M 40,125 Q 200,50 400,125 T 800,125" fill="none" strokeWidth="1.5" />
          </svg>
        </motion.div>
      </div>

      {/* ROW 2: CHART & AI ASSISTANT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Telemetry Chart */}
        <div className="lg:col-span-2 bento-card flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <Activity size={18} />
              </div>
              <h3 className="text-base font-bold text-foreground">Global Latency</h3>
            </div>
            <div className="flex gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-100">
               {['5m', '1h', '24h'].map(t => (
                 <button key={t} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${t === '1h' ? 'bg-white shadow-sm text-foreground' : 'text-muted hover:text-foreground'}`}>{t}</button>
               ))}
            </div>
          </div>
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#3B82F6" strokeWidth={3} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Embedded AI Assistant (Reference 1 Inspiration) */}
        <div className="bento-card flex flex-col relative overflow-hidden border-indigo-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-primary text-white flex items-center justify-center shadow-accent-glow">
              <Sparkles size={16} />
            </div>
            <h3 className="text-base font-bold text-foreground">H.O.M.E Intelligence</h3>
          </div>

          <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-2xl p-4 mb-4 flex flex-col justify-end">
             {aiResponse ? (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-sm text-gray-700 leading-relaxed relative">
                 <div className="absolute -top-3 -left-2 w-6 h-6 bg-accent-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm"><BrainCircuit size={12}/></div>
                 {aiResponse}
               </motion.div>
             ) : (
               <div className="text-center space-y-3 pb-6">
                 <BrainCircuit size={32} className="mx-auto text-indigo-200" />
                 <p className="text-xs text-muted font-medium px-4">I am monitoring your endpoints. Ask me anything about your system's health.</p>
               </div>
             )}
          </div>

          <form onSubmit={handleAiQuery} className="relative">
             <input 
               type="text" 
               placeholder="Where should I focus today?" 
               className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary shadow-sm"
               value={aiInput}
               onChange={e => setAiInput(e.target.value)}
             />
             <button disabled={aiLoading || !aiInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
               {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={16} />}
             </button>
          </form>
        </div>
      </div>

      {/* ROW 3: ENDPOINTS & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Endpoints List */}
        <div className="lg:col-span-2 bento-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-foreground">Active Endpoints</h3>
            <button onClick={() => navigate('/control-center')} className="text-xs font-bold text-accent-primary hover:underline">Manage All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {monitors.map((m) => (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => navigate(`/monitor/${m.id}`)}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-floating bg-white transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${m.status === 'UP' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-red-500 shadow-[0_0_8px_#EF4444] animate-pulse'}`}></div>
                    <div>
                      <h4 className="font-bold text-foreground group-hover:text-accent-primary transition-colors">{m.project_name}</h4>
                      <p className="text-xs text-muted font-medium">{m.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground font-mono">{m.last_response_time ? `${m.last_response_time}ms` : '--'}</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider mt-0.5">Latency</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bento-card">
          <h3 className="text-base font-bold text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { msg: 'API Server latency normalized', time: '12m ago', type: 'info', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
              { msg: 'Blog SSL Check Failed', time: '1h ago', type: 'error', icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
              { msg: 'Weekly Report Generated', time: '3h ago', type: 'info', icon: Search, color: 'text-indigo-500 bg-indigo-50' }
            ].map((ev, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ev.color}`}>
                   <ev.icon size={14} />
                </div>
                <div className="pt-1.5">
                   <p className="text-sm font-bold text-gray-800">{ev.msg}</p>
                   <p className="text-xs font-medium text-muted mt-0.5">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/incidents')} className="w-full mt-6 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600 transition-colors">
            View Full Timeline
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;