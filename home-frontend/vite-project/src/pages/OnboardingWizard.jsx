import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, Server, Mail, Clock, Phone, Activity, 
  ShieldCheck, Loader2, ArrowRight, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { requestWithRetry } from '../utils/api';

const normalizeUrl = (value) => {
  const cleaned = value.trim();
  if (!cleaned) return '';
  return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
};

const isUrlLike = (value) => {
  try {
    const parsed = new URL(normalizeUrl(value));
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
};

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    url: '',
    project_name: '',
    tracking_option: 'Is my website up/down',
    alert_email: '',
    frequency: '5m',
    whatsapp_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    const fetchUserEmail = async () => {
      if (localStorage.getItem('token') === 'demo-token') {
        setFormData(prev => ({ ...prev, alert_email: 'you@example.com' }));
        setLoading(false);
        return;
      }
      try {
        const res = await requestWithRetry(
          () => api.get('/auth/users/me'),
          5,
          2000
        );
        setFormData(prev => ({ ...prev, alert_email: res.data.email || '' }));
        if (res.data.onboarding_complete) {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Failed to load user email:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserEmail();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setToast('');

    if (!isUrlLike(formData.url)) {
      setError('Please enter a valid website URL (e.g. https://mywebsite.com).');
      return;
    }

    setSubmitting(true);
    try {
      const normalizedUrl = normalizeUrl(formData.url);
      
      const payload = {
        url: normalizedUrl,
        project_name: formData.project_name.trim() || undefined,
        website_type: formData.tracking_option, // mapped to website_type in backend schema
        notify_email: true,
        notify_dashboard: true,
        alert_email: formData.alert_email.trim() || null,
        weekly_reports: true,
        frequency: formData.frequency,
        whatsapp_number: formData.whatsapp_number.trim() || null
      };

      if (localStorage.getItem('token') !== 'demo-token') {
        const response = await requestWithRetry(
          () => api.post('/onboarding/setup', payload),
          5,
          2000,
          (retriesLeft, nextDelay) => {
            setError(`Connecting to server... Server is starting up (cold start). Retrying in ${nextDelay / 1000}s...`);
          }
        );
        sessionStorage.setItem('home.dashboard.bootstrap', JSON.stringify(response.data));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      setToast('Website added! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      console.error('Setup failed:', err);
      setError(err.response?.data?.detail || 'Failed to complete setup. Please check the URL and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const trackingOptions = [
    { id: 'Is my website up/down', title: 'Is my website up/down', desc: 'Checks if your site is online' },
    { id: 'Load speed', title: 'Load speed', desc: 'Measures page response speed' },
    { id: 'Basic health alerts', title: 'Basic health alerts', desc: 'Monitors errors & health changes' }
  ];

  const frequencyOptions = [
    { value: '1m', label: '1 min' },
    { value: '5m', label: '5 min' },
    { value: '15m', label: '15 min' },
    { value: '60m', label: '1 hour' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fbff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
          <p className="text-sm font-semibold text-gray-500">Preparing your setup wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_34%),linear-gradient(135deg,#f8fbff_0%,#eef4ff_48%,#f8fafc_100%)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-wider border border-indigo-100 shadow-sm">
            <Sparkles size={14} className="text-indigo-600" /> Let's get started
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
            Monitor your website
          </h1>
          <p className="text-gray-500 font-medium text-base">
            Complete this simple 1-step form to start tracking your site's health and uptime.
          </p>
        </div>

        {/* Wizard Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/70 border border-white/60 shadow-floating rounded-[32px] p-8 backdrop-blur-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Website URL */}
            <div className="space-y-2">
              <label htmlFor="url" className="block text-sm font-extrabold text-gray-800">
                Website Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="url"
                  type="text"
                  required
                  placeholder="https://mywebsite.com"
                  className="premium-input w-full pl-12 bg-white/80 py-4 text-base rounded-2xl"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <p className="text-xs text-gray-400 pl-1">Enter the URL of the website you wish to monitor.</p>
            </div>

            {/* Website Name (Optional) */}
            <div className="space-y-2">
              <label htmlFor="project_name" className="block text-sm font-extrabold text-gray-800">
                Website Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="project_name"
                  type="text"
                  placeholder="My Portfolio"
                  className="premium-input w-full pl-12 bg-white/80 py-4 text-base rounded-2xl"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                />
              </div>
            </div>

            {/* What to track */}
            <div className="space-y-3">
              <label className="block text-sm font-extrabold text-gray-800">
                What do you want to track?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {trackingOptions.map(option => {
                  const isSelected = formData.tracking_option === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tracking_option: option.id }))}
                      className={`
                        p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5
                        ${isSelected 
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm font-bold' 
                          : 'bg-white/80 border-gray-200 text-gray-600 hover:border-indigo-200 hover:bg-white'}
                      `}
                    >
                      <span className="text-sm">{option.title}</span>
                      <span className="text-[11px] text-gray-400 font-medium">{option.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alert Email & Check Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Alert Email */}
              <div className="space-y-2">
                <label htmlFor="alert_email" className="block text-sm font-extrabold text-gray-800">
                  Alert Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="alert_email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="premium-input w-full pl-11 bg-white/80 py-3.5 text-sm rounded-2xl"
                    value={formData.alert_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, alert_email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Check Frequency */}
              <div className="space-y-2">
                <label htmlFor="frequency" className="block text-sm font-extrabold text-gray-800">
                  How often to check?
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    id="frequency"
                    className="premium-input w-full pl-11 pr-8 bg-white/80 py-3.5 text-sm rounded-2xl appearance-none cursor-pointer"
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  >
                    {frequencyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* WhatsApp Number (Optional) */}
            <div className="space-y-2">
              <label htmlFor="whatsapp_number" className="block text-sm font-extrabold text-gray-800">
                WhatsApp Number <span className="text-gray-400 font-normal">(Optional, future-ready)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="whatsapp_number"
                  type="tel"
                  placeholder="+1234567890"
                  className="premium-input w-full pl-11 bg-white/80 py-3.5 text-sm rounded-2xl"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                />
              </div>
            </div>

            {/* Feedbacks / Errors */}
            {toast && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold flex items-center gap-2">
                <ShieldCheck size={18} />
                {toast}
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !!toast}
              className="premium-button w-full py-4 text-base font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 mt-8"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Configuring monitoring engine...
                </>
              ) : (
                <>
                  Start Monitoring Website
                  <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>
        </motion.div>
        
      </div>
    </div>
  );
};

export default OnboardingWizard;
