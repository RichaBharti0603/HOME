import React, { useState } from 'react';
import { 
  Bell, Mail, Shield, Zap, 
  Save, AlertTriangle, Info, CheckCircle2
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Simulate API save
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'notifications', label: 'Alerting System', icon: Bell },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'engine', label: 'Monitoring Nodes', icon: Zap },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Engine Settings</h1>
          <p className="text-gray-400">Configure global parameters and intelligence thresholds.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="premium-button flex items-center gap-2"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : success ? (
            <CheckCircle2 size={18} />
          ) : (
            <Save size={18} />
          )}
          {saving ? 'Synchronizing...' : success ? 'Settings Saved' : 'Commit Changes'}
        </button>
      </header>

      <div className="flex gap-2 p-1 bg-white/5 border border-border rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="premium-card p-8 space-y-8">
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="pb-6 border-b border-border">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Mail size={20} className="text-accent-primary" />
                Email Notification Pipeline
              </h3>
              <p className="text-sm text-gray-500">Configure SMTP settings for critical incident broadcasting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SMTP Server Host</label>
                <input 
                  type="text" 
                  placeholder="smtp.relay.host"
                  className="w-full bg-black/20 border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SMTP Port</label>
                <input 
                  type="text" 
                  placeholder="587"
                  className="w-full bg-black/20 border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Protocol</label>
                <select className="w-full bg-black/20 border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all appearance-none cursor-pointer">
                  <option>TLS (Recommended)</option>
                  <option>SSL</option>
                  <option>None</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sender Address</label>
                <input 
                  type="email" 
                  placeholder="alerts@h-o-m-e.ai"
                  className="w-full bg-black/20 border border-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-accent-primary/5 border border-accent-primary/10 rounded-xl flex items-start gap-4">
              <Info className="text-accent-primary shrink-0" size={20} />
              <p className="text-xs text-gray-400 leading-relaxed">
                By default, H.O.M.E will trigger alerts after <span className="text-accent-primary font-bold">2 consecutive failures</span> to reduce network noise. This can be customized in the Monitoring Nodes section.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
             <div className="pb-6 border-b border-border">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Shield size={20} className="text-accent-primary" />
                Access Control
              </h3>
              <p className="text-sm text-gray-500">Manage security tokens and API signatures.</p>
            </div>
            {/* Security content placeholder */}
            <p className="text-sm text-gray-500 italic">Advanced security parameters are governed by the IAM layer.</p>
          </div>
        )}

        {activeTab === 'engine' && (
          <div className="space-y-6">
             <div className="pb-6 border-b border-border">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Zap size={20} className="text-accent-primary" />
                Monitoring Intensity
              </h3>
              <p className="text-sm text-gray-500">Configure global polling logic and retry backoff strategy.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-border hover:border-accent-primary/20 transition-colors">
                <div>
                  <p className="text-sm font-bold text-white">Exponential Backoff</p>
                  <p className="text-xs text-gray-500">Double wait time between consecutive retries</p>
                </div>
                <div className="w-12 h-6 bg-accent-primary rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm"></div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-border hover:border-accent-primary/20 transition-colors">
                <div>
                  <p className="text-sm font-bold text-white">Smart Anomaly Detection (ZKML)</p>
                  <p className="text-xs text-gray-500">Enable privacy-preserving outlier analysis</p>
                </div>
                <div className="w-12 h-6 bg-accent-primary rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={20} />
          <div>
            <p className="text-sm font-bold text-white">Advanced Maintenance</p>
            <p className="text-xs text-gray-500">Flush all historical monitoring logs and metrics.</p>
          </div>
        </div>
        <button className="px-4 py-2 rounded-lg border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors">
          Purge Data
        </button>
      </div>
    </div>
  );
};

export default Settings;
