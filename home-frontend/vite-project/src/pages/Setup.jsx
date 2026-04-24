import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Globe, Clock, Shield, 
  ArrowRight, Info, Plus, Server,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { motion } from 'framer-motion';

const Setup = () => {
  const [formData, setFormData] = useState({
    project_name: '',
    url: '',
    frequency: '1m',
    alert_email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/monitors', formData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError('System rejection: Target URI or Name invalid.');
    } finally {
      setLoading(false);
    }
  };

  const frequencies = [
    { value: '30s', label: 'Real-time (30s)', pulse: true },
    { value: '1m', label: 'Active (1m)', pulse: false },
    { value: '5m', label: 'Balanced (5m)', pulse: false },
    { value: '15m', label: 'Economy (15m)', pulse: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2 underline decoration-accent-primary decoration-4 underline-offset-8">Deploy New Monitor</h1>
        <p className="text-muted font-medium">Link a digital target to your private observation mesh.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card !p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] ml-1">Target Project Name</label>
                  <div className="relative">
                    <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Production API Node"
                      className="premium-input w-full pl-12"
                      value={formData.project_name}
                      onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] ml-1">Universal Resource Identifier (URI)</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input 
                      type="url" 
                      required
                      placeholder="https://api.yourdomain.com"
                      className="premium-input w-full pl-12 font-mono"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] ml-1">Polling Intensity</label>
               <div className="grid grid-cols-2 gap-3">
                 {frequencies.map((freq) => (
                   <button
                    key={freq.value}
                    type="button"
                    onClick={() => setFormData({...formData, frequency: freq.value})}
                    className={`
                      p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                      ${formData.frequency === freq.value 
                        ? 'bg-accent-primary/10 border-accent-primary text-white shadow-accent-glow' 
                        : 'bg-surface/30 border-border text-muted hover:border-white/20'}
                    `}
                   >
                     {freq.pulse && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse"></div>}
                     <span className="text-xs font-bold uppercase tracking-widest">{freq.label}</span>
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] ml-1">Critical Alert Destination</label>
               <div className="relative">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <input 
                    type="email" 
                    placeholder="alerts@yourdomain.com"
                    className="premium-input w-full pl-12"
                    value={formData.alert_email}
                    onChange={(e) => setFormData({...formData, alert_email: e.target.value})}
                  />
               </div>
               <p className="text-[10px] text-muted ml-1">We'll broadcast outages to this address instantly.</p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-status-down/10 border border-status-down/20 text-status-down text-xs font-bold animate-in fade-in">
                {error}
              </div>
            )}

            <button 
              disabled={loading || success}
              className={`premium-button w-full py-4 text-base tracking-widest uppercase font-black transition-all ${
                success ? 'bg-status-up hover:bg-status-up' : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : success ? (
                <CheckCircle2 size={20} />
              ) : (
                <Zap size={20} />
              )}
              {loading ? 'Initializing Mesh...' : success ? 'Deployment Successful' : 'Deploy Monitor'}
            </button>
          </form>
        </motion.div>

        {/* SIDEBAR INFO */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
           <div className="glass-card !p-6 border-accent-primary/10">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-4">
                 <Shield size={20} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest leading-tight">Privacy Consensus</h3>
              <p className="text-xs text-muted leading-relaxed">
                H.O.M.E uses local ZK-Proof generation for anomaly detection. Your target URIs are never sold or shared with 3rd parties.
              </p>
           </div>

           <div className="glass-card !p-6 border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                 <Clock size={16} className="text-status-warn" />
                 <span className="text-[10px] font-black uppercase text-white tracking-widest">Polling Logic</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Intensity defines how frequently our edge nodes probe your target. <span className="text-white font-bold tracking-tight">Real-time</span> is recommended for critical production APIs.
              </p>
           </div>

           <div className="p-4 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 flex items-start gap-3">
              <Info className="text-accent-primary shrink-0" size={18} />
              <p className="text-[10px] text-muted font-medium leading-normal italic">
                Pro Tip: You can group monitors into virtual zones in the Settings panel.
              </p>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Setup;