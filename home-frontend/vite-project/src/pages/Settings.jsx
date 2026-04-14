import React, { useState } from 'react';
import { 
  Bell, Mail, Shield, Zap, 
  Save, AlertTriangle, Info, CheckCircle2,
  Lock, Key, Globe, Layout, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const tabs = [
    { id: 'notifications', label: 'Alert Signals', icon: Bell },
    { id: 'security', label: 'Access Control', icon: Shield },
    { id: 'engine', label: 'Node Engine', icon: Zap },
    { id: 'interface', label: 'Interface', icon: Layout },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Engine Configuration</h1>
          <p className="text-muted font-medium">Fine-tune global observability and threshold intelligence.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`premium-button px-8 py-3.5 shadow-2xl min-w-[180px] ${
             success ? 'bg-status-up shadow-status-up/20' : ''
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : success ? (
            <CheckCircle2 size={20} />
          ) : (
            <Save size={20} />
          )}
          <span className="tracking-widest uppercase font-black text-xs">
            {saving ? 'Syncing...' : success ? 'Config Applied' : 'Commit Changes'}
          </span>
        </button>
      </header>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-surface/50 border border-border rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-accent-primary text-white shadow-accent-glow' 
                : 'text-muted hover:text-foreground hover:bg-white/5'}
            `}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'animate-pulse' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card !p-10 border-white/5 bg-surface/20 min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'notifications' && (
            <motion.div 
              key="notifications"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-10"
            >
              <div className="pb-8 border-b border-border space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Mail size={22} className="text-accent-primary" />
                  Alert Pipeline Relay
                </h3>
                <p className="text-sm text-muted">Configure SMTP protocols for high-priority outage broadcasts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'SMTP Gateway', placeholder: 'smtp.provider.io', icon: Globe },
                  { label: 'Signal Port', placeholder: '587', icon: Settings },
                  { label: 'Security Mode', type: 'select', options: ['STARTTLS (High)', 'SSL (Legacy)', 'Plain'], icon: Lock },
                  { label: 'Broadcast Origin', placeholder: 'nodes@h-o-m-e.ai', icon: Mail },
                ].map((field, i) => (
                  <div key={i} className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white ml-1 flex items-center gap-2">
                       <field.icon size={12} className="text-muted" />
                       {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <div className="relative">
                        <select className="premium-input w-full appearance-none cursor-pointer">
                          {field.options.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">▼</div>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder={field.placeholder}
                        className="premium-input w-full font-mono"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 bg-accent-primary/5 border border-accent-primary/10 rounded-[20px] flex items-start gap-4">
                <div className="p-2.5 bg-accent-primary/20 rounded-xl text-accent-primary">
                  <Info size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white tracking-tight">Signal Persistence</p>
                  <p className="text-xs text-muted leading-relaxed">
                    By default, nodes will trigger a Broadcast after <span className="text-accent-primary font-black">2 consecutive failures</span>. This ensures signal noise is minimized during transient network blips.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              key="security"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-10"
            >
              <div className="pb-8 border-b border-border space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Shield size={22} className="text-status-warn" />
                  Access Consensus
                </h3>
                <p className="text-sm text-muted">Manage cryptographic keys and session integrity protocols.</p>
              </div>

              <div className="space-y-6">
                 {[
                   { label: 'Rotation Cycle', val: 'Every 90 Days', icon: RefreshCw },
                   { label: 'Auth Factor', val: 'Biometric / TOTP', icon: Key },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-accent-primary/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted group-hover:text-accent-primary transition-colors">
                            <item.icon size={20} />
                         </div>
                         <div>
                            <p className="text-xs font-black uppercase text-white tracking-widest">{item.label}</p>
                            <p className="text-[10px] text-muted font-bold tracking-widest">{item.val}</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-muted group-hover:text-white transition-colors" />
                   </div>
                 ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'engine' && (
            <motion.div 
              key="engine"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-10"
            >
              <div className="pb-8 border-b border-border space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Zap size={22} className="text-accent-secondary" />
                  Node Polling Engine
                </h3>
                <p className="text-sm text-muted">Configure the global intensity of the monitoring mesh.</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Exponential Backoff', desc: 'Double wait time between consecutive failover retries', active: true },
                  { label: 'Smart ZKML Analysis', desc: 'Enable Zero-Knowledge anomaly detection on the edge', active: true },
                  { label: 'Deep Packet Inspection', desc: 'Verify full payload integrity on every health check', active: false },
                ].map((toggle, i) => (
                  <div key={i} className="flex justify-between items-center p-6 glass border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-white uppercase tracking-widest">{toggle.label}</p>
                      <p className="text-xs text-muted font-medium">{toggle.desc}</p>
                    </div>
                    <div className={`w-14 h-7 rounded-full relative p-1 transition-colors cursor-pointer ${
                      toggle.active ? 'bg-accent-primary animate-pulse' : 'bg-surface border border-border'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-all absolute top-1 shadow-xl ${
                        toggle.active ? 'left-8' : 'left-1'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'interface' && (
             <motion.div 
              key="interface"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-10"
            >
              <div className="pb-8 border-b border-border space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Smartphone size={22} className="text-indigo-400" />
                  Visual Identity
                </h3>
                <p className="text-sm text-muted">Customize the aesthetic experience of the monitoring console.</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                 {['Onyx (Default)', 'Midnight', 'Solarized'].map(theme => (
                    <div key={theme} className={`p-10 rounded-2xl border flex flex-col items-center gap-4 transition-all cursor-pointer ${
                      theme === 'Onyx (Default)' ? 'bg-accent-primary/10 border-accent-primary shadow-accent-glow text-white' : 'bg-surface border-border text-muted hover:border-white/20'
                    }`}>
                       <div className={`w-12 h-12 rounded-full border-2 border-dashed ${theme === 'Onyx (Default)' ? 'border-accent-primary' : 'border-muted'}`}></div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">{theme}</span>
                    </div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DANGER ZONE */}
      <div className="p-8 rounded-[32px] border border-status-down/20 bg-status-down/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="flex items-center gap-6 relative z-10">
          <div className="p-4 bg-status-down/10 text-status-down rounded-2xl group-hover:scale-110 transition-transform">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-lg font-black text-white tracking-tight uppercase">System Hard-Reset</p>
            <p className="text-xs text-muted font-medium max-w-sm lowercase">Destructive action. Purges all historical metrics, node configurations, and incident logs permanently.</p>
          </div>
        </div>
        <button className="px-8 py-4 rounded-2xl border-2 border-status-down/30 text-status-down text-xs font-black uppercase tracking-widest hover:bg-status-down hover:text-white transition-all shadow-xl active:scale-95 relative z-10">
          Hard Reset Dashboard
        </button>
        <div className="absolute inset-0 bg-status-down/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Settings;
