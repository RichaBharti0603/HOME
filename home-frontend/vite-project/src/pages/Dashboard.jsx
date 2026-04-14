import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Globe, Zap, Clock, 
  ExternalLink, ArrowUpRight, ArrowDownRight, 
  Search, Filter, RefreshCcw, MoreVertical, X,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import { 
  AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

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

  const filteredMonitors = monitors.filter(m => 
    m.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: monitors.length,
    up: monitors.filter(m => m.status === 'UP').length,
    down: monitors.filter(m => m.status === 'DOWN').length,
    avgLatency: monitors.length ? 
      Math.round(monitors.reduce((acc, m) => acc + (m.last_response_time || 0), 0) / monitors.length) : 0
  };

  // Mock data for the chart - in a real app, this would come from /history
  const chartData = [
    { time: '10:00', latency: 45 },
    { time: '10:05', latency: 52 },
    { time: '10:10', latency: 48 },
    { time: '10:15', latency: 61 },
    { time: '10:20', latency: 55 },
    { time: '10:25', latency: 42 },
    { time: '10:30', latency: 49 },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-gray-500 animate-pulse font-medium">Synchronizing Engine...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-1">Systems Dashboard</h1>
          <p className="text-gray-400">Real-time observability across <span className="text-accent-primary font-bold">{stats.total}</span> active monitors.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/incidents')}
            className="p-2.5 rounded-xl border border-border hover:bg-white/5 transition-colors text-gray-400"
            title="Incident Timeline"
          >
            <Activity size={20} />
          </button>
          <button 
            onClick={fetchMonitors}
            className="p-2.5 rounded-xl border border-border hover:bg-white/5 transition-colors text-gray-400"
            title="Refresh Data"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={() => navigate('/setup')}
            className="premium-button flex items-center gap-2 py-2.5"
          >
            <Zap size={18} />
            Deploy Monitor
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Health', value: stats.total ? `${Math.round((stats.up/stats.total)*100)}%` : '0%', icon: Globe, color: 'text-blue-500', trend: '+2.4%' },
          { label: 'Active Nodes', value: stats.up, icon: Activity, color: 'text-green-500', trend: 'Stable' },
          { label: 'Critical Outages', value: stats.down, icon: Zap, color: 'text-red-500', trend: stats.down > 0 ? '+1' : 'None' },
          { label: 'Global Latency', value: `${stats.avgLatency}ms`, icon: Clock, color: 'text-purple-500', trend: '-12ms' },
        ].map((stat, idx) => (
          <div key={idx} className="premium-card p-6 group hover:border-accent-primary/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg bg-background border border-border group-hover:bg-white/5 transition-colors ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.trend.startsWith('+') ? 'bg-red-500/10 text-red-500' : 
                stat.trend.startsWith('-') ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-white tracking-tight leading-none mb-1">{stat.value}</div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Latency Trend Preview */}
      <div className="premium-card p-6 h-[200px] mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-accent-primary" />
            System Latency Trend (Baseline)
          </h3>
          <span className="text-xs text-gray-500">Last 30 minutes</span>
        </div>
        <div className="w-full h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="latency" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorLatency)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search projects by name or URL..."
            className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-border rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Monitors Table */}
      <div className="premium-card overflow-hidden !p-0 border-accent-primary/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-border">
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Target Project</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Health Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Network Latency</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Frequency</th>
                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredMonitors.map((monitor) => (
                <tr 
                  key={monitor.id} 
                  className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                  onClick={() => navigate(`/monitor/${monitor.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${monitor.status === 'UP' ? 'bg-green-500/50' : 'bg-red-500/50'}`}></div>
                      <div>
                        <div className="font-bold text-white group-hover:text-accent-primary transition-colors">{monitor.project_name}</div>
                        <div className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{monitor.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={monitor.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <span className={monitor.last_response_time > 500 ? 'text-yellow-500' : 'text-green-500'}>
                        {monitor.last_response_time ? `${monitor.last_response_time}ms` : '--'}
                      </span>
                      {monitor.last_response_time && (
                        monitor.last_response_time > 500 ? <ArrowUpRight size={14} className="text-yellow-500" /> : <ArrowDownRight size={14} className="text-green-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-background border border-border text-xs font-bold text-gray-400 capitalize">
                      <RefreshCcw size={10} />
                      {monitor.frequency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-500">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExplain(monitor.id);
                        }}
                        className="p-2 hover:bg-accent-primary/10 rounded-lg text-accent-primary transition-colors"
                        title="AI Explain"
                      >
                        <Zap size={18} />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg group-hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMonitors.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-full bg-white/5 text-gray-600">
                        <Search size={40} />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <p className="text-white font-bold mb-1">No Monitors Found</p>
                        <p className="text-sm text-gray-500">No projects match your current filters. Try searching for something else or add a new monitor.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Explanation Modal */}
      {explainingMonitor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-24 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl premium-card !p-0 overflow-hidden shadow-2xl border-accent-primary/20 animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-border bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-primary rounded-lg text-white">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">H.O.M.E intelligence</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Root Cause Analysis • {explainingMonitor.project_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setExplainingMonitor(null)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="p-6 bg-black/40 rounded-2xl border border-accent-primary/10 relative group">
                {explainLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-2 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest animate-pulse">Running Diagnostic Inference...</p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    <p className="text-gray-200 leading-relaxed font-medium">
                      {explanation}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-accent-primary font-bold uppercase tracking-wider bg-accent-primary/5 px-3 py-1.5 rounded-full w-fit">
                      <Zap size={10} />
                      Zero-Shot Local Inference Complete
                    </div>
                  </div>
                )}
              </div>

              {!explainLoading && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-border">
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Target URI</p>
                    <p className="text-xs font-mono text-gray-300 truncate">{explainingMonitor.url}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-border text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Impact Level</p>
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-red-500">
                      <AlertTriangle size={14} />
                      CRITICAL
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white/[0.02] border-t border-border flex justify-end">
              <button 
                onClick={() => setExplainingMonitor(null)}
                className="px-6 py-2 rounded-xl bg-accent-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors"
              >
                Acknowledge Root Cause
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;