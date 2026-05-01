import React, { useState } from 'react';
import { 
  Bell, Mail, Shield, Zap, 
  Save, AlertTriangle, Info, CheckCircle2,
  Lock, Key, Globe, Layout, Smartphone,
  Clock, ChevronRight
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
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'engine', label: 'Monitoring', icon: Zap },
    { id: 'interface', label: 'Appearance', icon: Layout },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Settings</h1>
          <p className="text-gray-500 font-medium">Manage your account, alerts, and system preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`premium-button px-8 py-3 min-w-[180px] shadow-md transition-all ${
             success ? 'bg-emerald-500 hover:bg-emerald-600 shadow-none' : ''
          }`}
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
          ) : success ? (
            <CheckCircle2 size={20} />
          ) : (
            <Save size={20} />
          )}
          <span className="font-semibold text-sm">
            {saving ? 'Saving...' : success ? 'Saved' : 'Save Changes'}
          </span>
        </button>
      </header>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 border border-gray-200 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
            `}
          >
            <tab.icon size={16} className={activeTab === tab.id ? 'text-accent-primary' : ''} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-sm min-h-[500px]">
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
              <div className="pb-6 border-b border-gray-100 space-y-1">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Mail size={20} className="text-accent-primary" />
                  Email Alerts
                </h3>
                <p className="text-sm text-gray-500">Configure how and when you receive downtime notifications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'Primary Email', placeholder: 'admin@mycompany.com', icon: Mail },
                  { label: 'Secondary Email', placeholder: 'devops@mycompany.com', icon: Mail },
                  { label: 'Alert Frequency', type: 'select', options: ['Immediately', 'After 5 mins of downtime', 'Daily Summary'], icon: Clock },
                  { label: 'Timezone', type: 'select', options: ['UTC', 'EST', 'PST', 'CET'], icon: Globe },
                ].map((field, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1 flex items-center gap-2">
                       <field.icon size={14} className="text-gray-400" />
                       {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <div className="relative">
                        <select className="premium-input w-full appearance-none cursor-pointer bg-white text-sm">
                          {field.options.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder={field.placeholder}
                        className="premium-input w-full bg-white text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-4">
                <div className="mt-0.5 text-accent-primary">
                  <Info size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900 tracking-tight">Smart Filtering</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    By default, we wait for <span className="font-semibold text-gray-900">2 consecutive failed checks</span> before sending an alert to prevent false alarms from temporary network blips.
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
              <div className="pb-6 border-b border-gray-100 space-y-1">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield size={20} className="text-emerald-500" />
                  Account Security
                </h3>
                <p className="text-sm text-gray-500">Manage your password and authentication settings.</p>
              </div>

              <div className="space-y-4">
                 {[
                   { label: 'Update Password', val: 'Last changed 30 days ago', icon: Key },
                   { label: 'Two-Factor Authentication', val: 'Not configured', icon: Smartphone },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-accent-primary transition-colors shadow-sm">
                            <item.icon size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500 font-medium">{item.val}</p>
                         </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
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
              <div className="pb-6 border-b border-gray-100 space-y-1">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Zap size={20} className="text-accent-secondary" />
                  Monitoring Preferences
                </h3>
                <p className="text-sm text-gray-500">Configure how we check your websites.</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Follow Redirects', desc: 'Automatically follow HTTP redirects during checks', active: true },
                  { label: 'SSL Certificate Expiry Alerts', desc: 'Notify me when SSL certificates are about to expire', active: true },
                  { label: 'Strict Status Codes', desc: 'Only consider 200 OK as successful', active: false },
                ].map((toggle, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900">{toggle.label}</p>
                      <p className="text-sm text-gray-500">{toggle.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative p-1 transition-colors ${
                      toggle.active ? 'bg-accent-primary' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-all absolute top-1 shadow-sm ${
                        toggle.active ? 'left-7' : 'left-1'
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
              <div className="pb-6 border-b border-gray-100 space-y-1">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layout size={20} className="text-indigo-400" />
                  Appearance
                </h3>
                <p className="text-sm text-gray-500">Customize the look and feel of your dashboard.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {['Light (Active)', 'Dark', 'System Match'].map((theme, i) => (
                    <div key={theme} className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                      i === 0 ? 'bg-indigo-50 border-accent-primary text-accent-primary shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                       <div className={`w-10 h-10 rounded-full border border-dashed ${i === 0 ? 'border-accent-primary' : 'border-gray-300'}`}></div>
                       <span className="text-sm font-semibold">{theme}</span>
                    </div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DANGER ZONE */}
      <div className="p-8 rounded-2xl border border-red-200 bg-red-50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4">
          <div className="p-3 bg-white text-red-500 rounded-xl shadow-sm border border-red-100 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">Delete Account</p>
            <p className="text-sm text-gray-600 mt-1 max-w-md">Permanently delete your account, all configured monitors, and historical uptime data. This action cannot be undone.</p>
          </div>
        </div>
        <button className="px-6 py-3 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-all shadow-sm shrink-0 whitespace-nowrap">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
