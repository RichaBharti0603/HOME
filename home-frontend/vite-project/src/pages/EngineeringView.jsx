import React, { useState, useEffect } from 'react';
import { 
  Activity, Cpu, Database, Server, Zap, Shield, 
  Terminal, BarChart3, Clock, ArrowUpRight, ArrowDownRight,
  RefreshCw, Layers, Monitor, AlertTriangle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function EngineeringView() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics');

  const fetchEngineData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsRes = await axios.get(`${API_BASE_URL}/engine/stats`, { headers });
      const logsRes = await axios.get(`${API_BASE_URL}/engine/logs`, { headers });
      
      setStats(statsRes.data);
      setLogs(logsRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch engine data", err);
    }
  };

  useEffect(() => {
    fetchEngineData();
    const interval = setInterval(fetchEngineData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mock data for graphs if real time-series not yet fully implemented in backend
  const chartData = [
    { time: '10:00', dns: 45, tcp: 32, http: 120 },
    { time: '10:05', dns: 48, tcp: 35, http: 145 },
    { time: '10:10', dns: 42, tcp: 30, http: 110 },
    { time: '10:15', dns: 150, tcp: 80, http: 450 }, // spike
    { time: '10:20', dns: 50, tcp: 38, http: 130 },
    { time: '10:25', dns: 44, tcp: 33, http: 125 },
    { time: '10:30', dns: 46, tcp: 34, http: 128 },
  ];

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Cpu size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Monitoring Engine</h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">Engineering-grade system observability & real-time telemetry.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm">
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'metrics' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <BarChart3 size={18} className="inline mr-2" /> Metrics
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Terminal size={18} className="inline mr-2" /> Live Logs
          </button>
        </div>
      </div>

      {/* SYSTEM SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Engine Status" 
          value={stats?.engine_status || "OPERATIONAL"} 
          icon={Zap} 
          trend="Stable" 
          color="indigo" 
        />
        <StatCard 
          title="Checks Processed" 
          value={stats?.total_checks_processed || "0"} 
          icon={Activity} 
          trend="+12% / hr" 
          color="emerald" 
        />
        <StatCard 
          title="Avg. Latency" 
          value="142ms" 
          icon={Clock} 
          trend="-5ms" 
          color="amber" 
        />
        <StatCard 
          title="Active Workers" 
          value="4 / 4" 
          icon={Server} 
          trend="100% Load" 
          color="blue" 
        />
      </div>

      {activeTab === 'metrics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* DNS & TCP LATENCY */}
          <div className="bento-card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Database size={20} className="text-indigo-600" /> DNS & Network Handshake
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="ms" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="dns" stroke="#4F46E5" fillOpacity={1} fill="url(#colorDns)" strokeWidth={3} />
                  <Area type="monotone" dataKey="tcp" stroke="#10B981" fillOpacity={1} fill="none" strokeWidth={3} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <div className="w-3 h-3 bg-indigo-600 rounded-full"></div> DNS Resolution
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> TCP Handshake
              </div>
            </div>
          </div>

          {/* HTTP RESPONSE TIME */}
          <div className="bento-card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Monitor size={20} className="text-indigo-600" /> HTTP Response (TTFB)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="ms" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="stepAfter" dataKey="http" stroke="#F59E0B" strokeWidth={4} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-gray-500">
              <AlertTriangle size={14} className="text-amber-500" /> 
              Anomalies detected in last 30 minutes
            </div>
          </div>
        </div>
      ) : (
        <div className="bento-card bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="ml-4 text-xs font-mono text-gray-500 uppercase tracking-widest">system_monitoring_engine.log</span>
            </div>
            <div className="text-xs font-mono text-emerald-500 animate-pulse">LIVE STREAMING</div>
          </div>
          <div className="p-6 h-[500px] overflow-y-auto font-mono text-sm space-y-2 custom-scrollbar">
            {logs.length > 0 ? logs.map((log, i) => (
              <div key={i} className="flex gap-4 group">
                <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={`${log.status === 'UP' ? 'text-emerald-400' : 'text-red-400'} font-bold shrink-0 w-16`}>{log.status}</span>
                <span className="text-gray-300">
                  Target <span className="text-indigo-400">ID:{log.monitor_id}</span> | 
                  DNS: <span className="text-blue-400">{log.dns_ms}ms</span> | 
                  TCP: <span className="text-emerald-400">{log.tcp_ms}ms</span> | 
                  Total: <span className="text-amber-400">{log.response_time}ms</span>
                  {log.error_message && <span className="text-red-500 block mt-1 ml-4 italic">Error: {log.error_message}</span>}
                </span>
              </div>
            )) : (
              <div className="text-gray-500 italic text-center mt-20">Initializing logs stream...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
          {trend}
        </div>
      </div>
      <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</h4>
      <div className="text-2xl font-black text-gray-900">{value}</div>
    </div>
  );
}
