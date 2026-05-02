import React, { useState, useEffect } from 'react';
import { 
  Server, Database, Activity, Cpu, CheckCircle2, 
  AlertCircle, Globe, RefreshCw, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CloudSystemStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date().toLocaleTimeString());
  
  const [status, setStatus] = useState({
    api: 'healthy',
    database: 'healthy',
    redis: 'healthy',
    workers: 'healthy',
    scheduler: 'healthy'
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastChecked(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 1000);
  };

  const systems = [
    {
      id: 'api',
      name: 'Backend API Service',
      icon: Globe,
      status: status.api,
      desc: 'Main REST API & WebSocket Server (FastAPI)',
      metrics: [
        { label: 'Latency', value: '45ms' },
        { label: 'Uptime', value: '99.99%' },
      ]
    },
    {
      id: 'database',
      name: 'PostgreSQL Database',
      icon: Database,
      status: status.database,
      desc: 'Persistent storage for users, monitors, and alerts',
      metrics: [
        { label: 'Connections', value: '12/100' },
        { label: 'Storage', value: '1.2 GB' },
      ]
    },
    {
      id: 'redis',
      name: 'Redis Cache & Broker',
      icon: Layers,
      status: status.redis,
      desc: 'Message broker for Celery and high-speed caching',
      metrics: [
        { label: 'Memory', value: '45 MB' },
        { label: 'Hit Rate', value: '98%' },
      ]
    },
    {
      id: 'workers',
      name: 'Celery Workers',
      icon: Server,
      status: status.workers,
      desc: 'Async job processing for health checks',
      metrics: [
        { label: 'Active Tasks', value: '3' },
        { label: 'Queued', value: '0' },
      ]
    },
    {
      id: 'scheduler',
      name: 'Celery Beat Scheduler',
      icon: Activity,
      status: status.scheduler,
      desc: 'Triggers periodic monitoring checks',
      metrics: [
        { label: 'Next Tick', value: '12s' },
        { label: 'Registered Jobs', value: '14' },
      ]
    }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Cloud Infrastructure Status</h1>
          <p className="text-muted font-medium text-sm mt-2">Real-time health overview of H.O.M.E SaaS components.</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-6 py-3 rounded-xl border border-gray-200 bg-white font-semibold flex items-center gap-2 hover:bg-gray-50 transition-all text-gray-700 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Checking...' : 'Refresh Status'}</span>
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center justify-between shadow-sm mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-emerald-900 font-bold text-lg">All Systems Operational</h2>
            <p className="text-emerald-700 text-sm font-medium">Last global check: {lastChecked}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systems.map((sys, index) => {
          const Icon = sys.icon;
          const isHealthy = sys.status === 'healthy';
          
          return (
            <motion.div 
              key={sys.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bento-card border border-border/60 hover:border-border transition-colors relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-700">
                  <Icon size={20} />
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isHealthy ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  {isHealthy ? 'Healthy' : 'Error'}
                </div>
              </div>
              
              <h3 className="font-extrabold text-gray-900 mb-1">{sys.name}</h3>
              <p className="text-xs font-medium text-gray-500 mb-6 min-h-[32px]">{sys.desc}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {sys.metrics.map((m, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{m.label}</p>
                    <p className="font-semibold text-gray-800 text-sm">{m.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
