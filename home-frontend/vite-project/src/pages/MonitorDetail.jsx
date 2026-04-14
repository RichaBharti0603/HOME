import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Clock, Activity, ShieldCheck, History, 
  Info, ArrowLeft, Trash2, Globe, Zap,
  AlertCircle, ChevronRight, Terminal
} from 'lucide-react';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import LogsViewer from '../components/LogsViewer';

const MonitorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [monitor, setMonitor] = useState(null);
  const [history, setHistory] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [monRes, histRes, aiRes] = await Promise.all([
        api.get(`/monitors/${id}`),
        api.get(`/history/${id}`),
        api.get(`/ai/explain/${id}`)
      ]);
      setMonitor(monRes.data);
      setHistory(histRes.data);
      setExplanation(aiRes.data.response);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch monitor details', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const deleteMonitor = async () => {
    if (window.confirm('Are you sure you want to decommission this monitor? All history will be purged.')) {
      try {
        await api.delete(`/monitors/${id}`);
        navigate('/dashboard');
      } catch (err) {
        alert('Failed to delete monitor');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-gray-500 animate-pulse font-medium text-sm tracking-widest uppercase">Initializing Probe {id}...</p>
    </div>
  );

  const chartData = history.map(h => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: h.response_time || 0,
    status: h.status
  })).slice(-40);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="mt-1 p-2.5 bg-white/5 border border-border rounded-xl hover:bg-white/10 transition-colors text-gray-400"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white tracking-tight leading-none">{monitor.project_name}</h1>
              <StatusBadge status={monitor.status} />
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Globe size={14} /> {monitor.url}</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span className="flex items-center gap-1.5 font-mono">ID: {id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={deleteMonitor}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold"
          >
            <Trash2 size={18} />
            Decommission
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Observation Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latency Intelligence Chart */}
          <div className="premium-card p-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={16} className="text-accent-primary" />
                  Latency Intelligence
                </h3>
                <p className="text-xs text-gray-500 mt-1">Global p95 response time trends</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-black">Current</p>
                  <p className="text-lg font-mono font-bold text-white">{monitor.last_response_time || 0}ms</p>
                </div>
                <div className="text-right border-l border-border pl-4">
                  <p className="text-[10px] text-gray-500 uppercase font-black">Success</p>
                  <p className="text-lg font-mono font-bold text-green-500">100%</p>
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLatencyDetail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    interval={Math.ceil(chartData.length / 8)}
                  />
                  <YAxis 
                    stroke="#444" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    unit="ms" 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #222', borderRadius: '12px' }}
                    labelStyle={{ color: '#666', marginBottom: '4px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorLatencyDetail)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Event Logs View */}
          <div className="premium-card p-6">
            <LogsViewer logs={history.slice().reverse()} />
          </div>
        </div>

        {/* Intelligence Side Panel */}
        <div className="space-y-6">
          {/* AI Explanation Engine */}
          <div className="premium-card p-6 bg-accent-primary/[0.03] border-accent-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={100} className="text-accent-primary rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent-primary rounded-lg text-white">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">H.O.M.E Analysis</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-black/40 rounded-xl border border-accent-primary/10">
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    {explanation || "Initializing local analysis engine..."}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-accent-primary/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Check Frequency</p>
                      <p className="text-sm font-bold text-white">{monitor.frequency}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Fail Threshold</p>
                      <p className="text-sm font-bold text-white">{monitor.threshold_ms}ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Context */}
          <div className="premium-card p-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal size={14} />
              Infrastructure Meta
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Node Location</span>
                <span className="font-bold text-gray-300">Localhost (US-East-1)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Monitor Typology</span>
                <span className="font-bold text-gray-300 capitalize">{monitor.monitor_type} Check</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last Resolution</span>
                <span className="font-bold text-green-500">200 OK</span>
              </div>
            </div>
          </div>

          {/* Intelligence Shortcuts */}
          <button 
            onClick={() => navigate('/assistant')}
            className="w-full premium-card p-4 hover:border-accent-primary transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg group-hover:text-accent-primary transition-colors">
                <ShieldCheck size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Ask Assistant</p>
                <p className="text-[10px] text-gray-500">Deep dive into failure roots</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonitorDetail;
