import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, Globe, Clock, ShieldCheck, ArrowRight, CheckCircle2, Shield, AlertTriangle
} from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingWizard = () => {
  const [step, setStep] = useState(1);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [provisionError, setProvisionError] = useState('');
  
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const [formData, setFormData] = useState({
    project_name: '',
    url: '',
    frequency: '1m',
    expected_status: 200,
    expected_keyword: '',
    alert_emails: '',
    max_retries: 3,
    cooldown_minutes: 15
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user already completed onboarding
    api.get('/auth/users/me').then(res => {
      if (res.data.onboarding_complete && res.data.payment_status === 'active') {
        navigate('/dashboard');
      }
    }).catch(err => console.error(err));
  }, [navigate]);

  const handleValidate = async () => {
    if (!formData.url) return;
    setValidating(true);
    setValidationError('');
    setValidationResult(null);
    try {
      if (localStorage.getItem('token') === 'demo-token') {
        setTimeout(() => {
          setValidationResult({
            hostname: new URL(formData.url).hostname,
            ip_address: '192.168.1.1',
            server: 'nginx/1.24.0',
            ssl_issuer: "Let's Encrypt Authority X3",
            ssl_expiry_days: 45
          });
          setValidating(false);
          setStep(2);
        }, 1500);
        return;
      }
      
      const res = await api.post('/monitors/validate', { url: formData.url });
      setValidationResult(res.data);
      setStep(2);
    } catch (err) {
      setValidationError(err.response?.data?.detail || "Validation failed. Check URL.");
    } finally {
      setValidating(false);
    }
  };

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await api.get('/billing/plans');
      setPlans(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleProvision = async () => {
    setProvisionError('');
    // Save the monitor to the backend
    try {
      if (localStorage.getItem('token') !== 'demo-token') {
        const payload = {
          project_name: formData.project_name,
          url: formData.url,
          frequency: formData.frequency,
          monitor_type: "HTTP",
          expected_status: parseInt(formData.expected_status),
          expected_keyword: formData.expected_keyword || null,
          alert_policy: {
            channels: ['dashboard', 'email'],
            emails: formData.alert_emails.split(',').map(e => e.trim()).filter(e => e),
            cooldown_minutes: parseInt(formData.cooldown_minutes)
          },
          retry_policy: {
            max_retries: parseInt(formData.max_retries)
          }
        };
        await api.post('/monitors', payload);
      }
      
      // Move to pricing step
      await loadPlans();
      setStep(4);
    } catch (err) {
      console.error(err);
      setProvisionError(err.response?.data?.detail || "Failed to provision monitor.");
    }
  };

  const handleSelectPlan = async (planId) => {
    if (localStorage.getItem('token') === 'demo-token') {
       navigate('/dashboard'); // Bypass payment for demo mode
       return;
    }
    
    try {
      const res = await api.post('/billing/subscription/create', { plan_id: planId });
      // Redirect to Stripe
      window.location.href = res.data.url;
    } catch(err) {
      console.error(err);
      alert('Failed to initialize checkout');
    }
  };

  const frequencies = [
    { value: '30s', label: '30 Seconds' },
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <img src="/images/logo.jpg" alt="Logo" className="mx-auto h-20 w-auto rounded-2xl shadow-sm mb-6" />
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome to H.O.M.E</h2>
          <p className="mt-2 text-sm text-gray-600">Let's set up your first monitor and activate your account.</p>
        </div>

        <div className="bento-card bg-white shadow-xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3, 4].map(s => (
               <div key={s} className="flex items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-accent-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                   {s}
                 </div>
                 {s < 4 && <div className={`w-12 h-1 rounded-full ${step > s ? 'bg-accent-primary' : 'bg-gray-100'}`}></div>}
               </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">1. Website Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Website Name</label>
                    <div className="relative">
                      <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})} className="premium-input w-full pl-12 bg-gray-50" placeholder="e.g. Production API" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">URL Endpoint</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="premium-input w-full pl-12 bg-gray-50 font-mono text-sm" placeholder="https://api.example.com/health" />
                    </div>
                  </div>
                </div>
                {validationError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} /> {validationError}
                  </div>
                )}
                <div className="flex justify-end pt-6">
                  <button onClick={handleValidate} disabled={validating || !formData.url || !formData.project_name} className="premium-button px-8 py-3 font-semibold shadow-md">
                    {validating ? 'Validating...' : 'Next Step'} <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">2. Verification</h3>
                {validationResult && (
                  <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-accent-primary shrink-0">
                      <Shield size={24} />
                    </div>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Target IP</p>
                        <p className="text-sm font-bold text-foreground font-mono mt-1">{validationResult.ip_address || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted tracking-wider">Server</p>
                        <p className="text-sm font-bold text-foreground mt-1">{validationResult.server || 'Hidden'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted tracking-wider">SSL Issuer</p>
                        <p className="text-sm font-bold text-foreground mt-1 truncate" title={validationResult.ssl_issuer}>{validationResult.ssl_issuer || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted tracking-wider">SSL Expiry</p>
                        <p className="text-sm font-bold text-emerald-600 mt-1">{validationResult.ssl_expiry_days ? `${validationResult.ssl_expiry_days} Days` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-6">
                  <button onClick={() => setStep(1)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="premium-button px-8 py-3 font-semibold shadow-md">
                    Next Step <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">3. Monitoring Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Interval</label>
                    <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="premium-input w-full bg-gray-50">
                      {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Expected Code</label>
                    <input type="number" value={formData.expected_status} onChange={e => setFormData({...formData, expected_status: e.target.value})} className="premium-input w-full bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Max Retries</label>
                    <input type="number" min="1" max="10" value={formData.max_retries} onChange={e => setFormData({...formData, max_retries: e.target.value})} className="premium-input w-full bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Cooldown (m)</label>
                    <input type="number" min="1" value={formData.cooldown_minutes} onChange={e => setFormData({...formData, cooldown_minutes: e.target.value})} className="premium-input w-full bg-gray-50" />
                  </div>
                </div>
                {provisionError && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertTriangle size={16} /> {provisionError}
                  </div>
                )}
                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <button onClick={() => setStep(2)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                  <button onClick={handleProvision} className="premium-button px-8 py-3 font-semibold shadow-md bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30">
                    Provision Monitor <CheckCircle2 size={16} className="ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Choose a Plan to Activate</h3>
                  <p className="text-muted mt-2">Your monitor is ready. Select a subscription plan to start monitoring.</p>
                </div>
                
                {loadingPlans ? (
                  <div className="text-center py-12 text-gray-500">Loading plans...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => (
                      <div key={plan.id} className="border border-gray-200 rounded-2xl p-6 bg-white hover:border-accent-primary hover:shadow-xl transition-all cursor-pointer flex flex-col">
                        <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                        <div className="mt-4 mb-6">
                          <span className="text-4xl font-extrabold text-gray-900">${(plan.price/100).toFixed(2)}</span>
                          <span className="text-gray-500">/mo</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                          {plan.features?.map((f, i) => (
                            <li key={i} className="flex items-center text-sm text-gray-600">
                              <CheckCircle2 size={16} className="text-emerald-500 mr-2 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => handleSelectPlan(plan.id)} className="w-full premium-button justify-center">Select {plan.name}</button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
