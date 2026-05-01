import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, Globe, Clock, Shield, 
  ArrowRight, Info, Plus, Server,
  AlertCircle, CheckCircle2
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
    
    // Mock for demo token
    if (localStorage.getItem('token') === 'demo-token') {
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      }, 1000);
      return;
    }

    try {
      await api.post('/monitors', formData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError('Could not add website. Please check the URL and try again.');
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
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <header>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Add Your Website</h1>
        <p className="text-gray-500 font-medium">Enter your website details below to start monitoring its health.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM SECTION */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card bg-white border-gray-200"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-5">
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Website Name</label>
                  <div className="relative">
                    <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. My Online Store"
                      className="premium-input w-full pl-12 bg-white"
                      value={formData.project_name}
                      onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Website URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="url" 
                      required
                      placeholder="https://www.mywebsite.com"
                      className="premium-input w-full pl-12 bg-white font-mono text-sm"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <label className="text-sm font-semibold text-gray-700 ml-1">Check Frequency</label>
               <div className="grid grid-cols-2 gap-3">
                 {frequencies.map((freq) => (
                   <button
                    key={freq.value}
                    type="button"
                    onClick={() => setFormData({...formData, frequency: freq.value})}
                    className={`
                      p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                      ${formData.frequency === freq.value 
                        ? 'bg-indigo-50 border-accent-primary text-accent-primary shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}
                    `}
                   >
                     {freq.pulse && formData.frequency === freq.value && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse"></div>}
                     <span className="text-sm font-medium">{freq.label}</span>
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-semibold text-gray-700 ml-1">Alert Email</label>
               <div className="relative">
                  <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="alerts@mywebsite.com"
                    className="premium-input w-full pl-12 bg-white"
                    value={formData.alert_email}
                    onChange={(e) => setFormData({...formData, alert_email: e.target.value})}
                  />
               </div>
               <p className="text-xs text-gray-500 ml-1 mt-1">We'll send notifications here if your site goes down.</p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <button 
              disabled={loading || success}
              className={`premium-button w-full py-3.5 text-base font-semibold transition-all shadow-md ${
                success ? 'bg-status-up hover:bg-status-up shadow-none' : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
              ) : success ? (
                <CheckCircle2 size={20} />
              ) : (
                <Plus size={20} />
              )}
              {loading ? 'Adding Website...' : success ? 'Website Added Successfully' : 'Add Website'}
            </button>
          </form>
        </motion.div>

        {/* SIDEBAR INFO */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
           <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-accent-primary mb-4">
                 <Shield size={20} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Private & Secure</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We monitor your website from the outside. Your internal data, customer information, and code remain entirely private.
              </p>
           </div>

           <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                 <Clock size={16} className="text-status-warn" />
                 <span className="text-sm font-bold text-gray-900">Check Frequency</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                This determines how often we verify your site is online. <span className="text-gray-900 font-semibold">Real-time</span> checking is best for mission-critical stores and apps.
              </p>
           </div>

           <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
              <Info className="text-accent-primary shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-accent-primary font-medium leading-relaxed">
                Tip: You can change these settings later from your dashboard anytime.
              </p>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Setup;