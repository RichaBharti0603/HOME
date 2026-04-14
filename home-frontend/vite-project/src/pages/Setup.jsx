import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Globe, Clock, Server, 
  ArrowLeft, Zap, CheckCircle2, 
  ChevronRight, AlertCircle, Cpu
} from 'lucide-react';
import api from '../utils/api';

const Setup = () => {
  const [formData, setFormData] = useState({
    project_name: '',
    url: '',
    frequency: '30s',
    monitor_type: 'HTTP',
    threshold_ms: 2000
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/setup', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Handshake failed. Ensure the URL is reachable and the backend engine is active.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left: Info & Context */}
        <div className="md:w-1/3 space-y-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Deploy Monitor</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connect your production assets to the H.O.M.E intelligence engine. We'll start monitoring latency and uptime immediately.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent-primary/5 border border-accent-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={16} className="text-accent-primary" />
                <h4 className="text-xs font-black uppercase text-accent-primary">Local Probes</h4>
              </div>
              <p className="text-xs text-gray-400">All checks originate from this machine. 100% data residency.</p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-border">
              <div className="flex items-center gap-2 mb-2 text-gray-300">
                <CheckCircle2 size={16} />
                <h4 className="text-xs font-black uppercase">Edge Ready</h4>
              </div>
              <p className="text-xs text-gray-500 font-mono">Status: WAITING_FOR_PAYLOAD</p>
            </div>
          </div>
        </div>

        {/* Right: The Form */}
        <div className="md:w-2/3">
          <div className="premium-card p-8 border-accent-primary/5">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1">Target Description</label>
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent-primary transition-colors" size={20} />
                    <input
                      required
                      autoFocus
                      className="w-full bg-background border border-border rounded-xl px-4 py-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all placeholder:text-gray-700"
                      placeholder="e.g. Primary Kubernetes API"
                      value={formData.project_name}
                      onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1">Endpoint URI</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent-primary transition-colors" size={20} />
                    <input
                      required
                      type="url"
                      className="w-full bg-background border border-border rounded-xl px-4 py-4 pl-12 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all placeholder:text-gray-700"
                      placeholder="https://api.myapp.com/v1/health"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1">Poll Frequency</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={20} />
                      <select
                        className="w-full bg-background border border-border rounded-xl px-4 py-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all appearance-none cursor-pointer"
                        value={formData.frequency}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      >
                        <option value="3s">3 Seconds (Nitro)</option>
                        <option value="10s">10 Seconds</option>
                        <option value="30s">30 Seconds</option>
                        <option value="60s">60 Seconds</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-gray-500 tracking-widest ml-1">Protocol Type</label>
                    <div className="relative">
                      <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={20} />
                      <select
                        className="w-full bg-background border border-border rounded-xl px-4 py-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all appearance-none cursor-pointer"
                        value={formData.monitor_type}
                        onChange={(e) => setFormData({ ...formData, monitor_type: e.target.value })}
                      >
                        <option value="HTTP">REST / HTTPS</option>
                        <option value="PING">ICMP Ping</option>
                        <option value="TCP">TCP Socket</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5 bg-white/[0.02] border border-border rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-sm font-bold text-gray-300">Alert Sensitivity</label>
                      <p className="text-[10px] text-gray-500 uppercase font-black">Latency Threshold</p>
                    </div>
                    <span className="text-accent-primary font-mono font-bold">{formData.threshold_ms}ms</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    className="w-full accent-accent-primary"
                    value={formData.threshold_ms}
                    onChange={(e) => setFormData({ ...formData, threshold_ms: parseInt(e.target.value) })}
                  />
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 italic">
                    <AlertCircle size={12} />
                    Flags slow responses beyond this threshold as "Warning" state.
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5" />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full premium-button py-4 text-sm font-black flex items-center justify-center gap-2 group tracking-widest uppercase"
              >
                {loading ? 'Sychronizing Probes...' : (
                  <>
                    Initialize Engine
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;