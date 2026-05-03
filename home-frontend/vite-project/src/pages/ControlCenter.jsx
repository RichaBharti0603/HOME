import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Server, Globe, Clock, Plus, Settings2, ShieldCheck, 
  Trash2, ArrowRight, Activity, Search, ChevronDown, CheckCircle2, AlertTriangle, Shield
} from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const ControlCenter = () => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [healthData, setHealthData] = useState(null);
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState('');

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

  const fetchMonitors = async () => {
    try {
      if (localStorage.getItem('token') === 'demo-token') {
        setMonitors([
          { id: 1, project_name: 'Main Website', url: 'https://home.ai', frequency: '1m', status: 'UP' },
          { id: 2, project_name: 'API Server', url: 'https://api.home.ai', frequency: '30s', status: 'UP' }
        ]);
        setHealthData({
            status: "healthy",
            database: "connected",
            redis: "connected",
            scheduler: "running",
            workers: 1
        });
        setLoading(false);
        return;
      }
      const response = await api.get('/monitors');
      setMonitors(response.data);
      
      const healthRes = await api.get('/system/health');
      setHealthData(healthRes.data);
    } catch (err) {
      console.error('Failed to fetch monitors/health', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
    
    // Refresh health periodically
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
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

    try {
      if (localStorage.getItem('token') !== 'demo-token') {
        await api.post('/monitors', payload);
      }
      setShowAddForm(false);
      setStep(1);
      setValidationResult(null);
      setFormData({
        project_name: '', url: '', frequency: '1m', expected_status: 200, 
        expected_keyword: '', alert_emails: '', max_retries: 3, cooldown_minutes: 15
      });
      fetchMonitors();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const frequencies = [
    { value: '30s', label: '30 Seconds' },
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Control Center</h1>
          <p className="text-muted font-medium text-sm">Configure validation rules, retry policies, and alert routing.</p>
        </div>
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setStep(1);
          }}
          className="premium-button"
        >
          {showAddForm ? <ArrowRight size={18} /> : <Plus size={18} />}
          <span>{showAddForm ? 'Cancel' : 'New Monitor'}</span>
        </button>
      </header>

      {/* System Health Panel */}
      {!showAddForm && healthData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bento-card bg-white p-5 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">System Engine</p>
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${healthData.status === 'healthy' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-amber-500'}`}></div>
                    <p className="text-sm font-bold text-foreground capitalize">{healthData.status}</p>
                </div>
            </div>
            <div className="bento-card bg-white p-5 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Workers</p>
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${healthData.workers > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <p className="text-sm font-bold text-foreground">{healthData.workers} Active</p>
                </div>
            </div>
            <div className="bento-card bg-white p-5 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Queue Depth</p>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-primary"></div>
                    <p className="text-sm font-bold text-foreground">{healthData.pending_jobs} Pending</p>
                </div>
            </div>
            <div className="bento-card bg-white p-5 flex flex-col justify-center">
                <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Active Monitors</p>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent-primary"></div>
                    <p className="text-sm font-bold text-foreground">{monitors.length}</p>
                </div>
            </div>
        </div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bento-card mb-8 bg-gradient-to-br from-white to-gray-50/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-accent-primary rounded-xl"><Settings2 size={20} /></div>
                  Add Website Wizard
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-accent-primary text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-accent-primary' : 'bg-gray-100'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-accent-primary text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <div className={`w-8 h-1 rounded-full ${step >= 3 ? 'bg-accent-primary' : 'bg-gray-100'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-accent-primary text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
                </div>
              </div>

              <div className="space-y-8">
                {/* STEP 1: TARGET */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Website Name</label>
                        <div className="relative">
                          <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input type="text" value={formData.project_name} onChange={e => setFormData({...formData, project_name: e.target.value})} className="premium-input w-full pl-12 bg-white" placeholder="e.g. Production API" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">URL Endpoint</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="premium-input w-full pl-12 bg-white font-mono text-sm" placeholder="https://api.example.com/health" />
                        </div>
                      </div>
                    </div>
                    {validationError && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                        <AlertTriangle size={16} /> {validationError}
                      </div>
                    )}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button onClick={handleValidate} disabled={validating || !formData.url || !formData.project_name} className="premium-button px-8 py-3 font-semibold shadow-md">
                        {validating ? 'Validating...' : 'Next: Verification'} <ArrowRight size={16} className="ml-2" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: PREVIEW & CHECKS */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Check Interval</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="premium-input w-full pl-12 bg-white appearance-none">
                            {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Expected Status Code</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input type="number" value={formData.expected_status} onChange={e => setFormData({...formData, expected_status: e.target.value})} className="premium-input w-full pl-12 bg-white font-mono text-sm" placeholder="200" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Expected Keyword (Optional)</label>
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input type="text" value={formData.expected_keyword} onChange={e => setFormData({...formData, expected_keyword: e.target.value})} className="premium-input w-full pl-12 bg-white font-mono text-sm" placeholder="e.g. 'success'" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <button onClick={() => setStep(1)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                      <button onClick={() => setStep(3)} className="premium-button px-8 py-3 font-semibold shadow-md">
                        Next: Policies <ArrowRight size={16} className="ml-2" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: POLICIES */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Max Retries</label>
                        <input type="number" min="1" max="10" value={formData.max_retries} onChange={e => setFormData({...formData, max_retries: e.target.value})} className="premium-input w-full bg-white" />
                        <p className="text-xs text-gray-500 ml-1">Failures before alert.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Cooldown Minutes</label>
                        <input type="number" min="1" value={formData.cooldown_minutes} onChange={e => setFormData({...formData, cooldown_minutes: e.target.value})} className="premium-input w-full bg-white" />
                        <p className="text-xs text-gray-500 ml-1">Suppress duplicate alerts.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Alert Emails</label>
                        <input type="text" value={formData.alert_emails} onChange={e => setFormData({...formData, alert_emails: e.target.value})} className="premium-input w-full bg-white" placeholder="Comma separated" />
                      </div>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-gray-100">
                      <button onClick={() => setStep(2)} className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                      <button onClick={handleSubmit} disabled={saving} className="premium-button px-8 py-3 font-semibold shadow-md bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30">
                        {saving ? 'Provisioning...' : 'Provision Monitor'} <CheckCircle2 size={16} className="ml-2" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bento-card overflow-hidden !p-0">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-lg font-bold text-foreground">Active Provisioned Monitors</h3>
        </div>
        
        {loading ? (
          <div className="p-16 text-center text-muted font-medium">Loading control plane...</div>
        ) : monitors.length === 0 ? (
          <div className="p-24 text-center space-y-4">
            <Activity className="mx-auto text-gray-300" size={48} />
            <p className="text-muted font-medium">No monitors configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] uppercase tracking-widest text-muted font-bold">
                  <th className="p-5 pl-8">Target Endpoint</th>
                  <th className="p-5">Interval</th>
                  <th className="p-5">Validation Matrix</th>
                  <th className="p-5">Retries</th>
                  <th className="p-5 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {monitors.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${m.status === 'UP' ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : m.status === 'DOWN' ? 'bg-red-500 shadow-[0_0_8px_#EF4444] animate-pulse' : 'bg-gray-400'}`}></div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{m.project_name}</p>
                          <p className="text-[11px] text-muted font-mono mt-0.5">{m.url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-bold text-muted">{m.frequency}</td>
                    <td className="p-5">
                      <div className="flex gap-2 items-center">
                         <span className="px-2.5 py-1 rounded-md bg-gray-50 text-[11px] font-bold font-mono border border-gray-200 text-gray-600">HTTP {m.expected_status || 200}</span>
                         {m.expected_keyword && <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-accent-primary text-[11px] border border-indigo-100 font-bold font-mono">'{m.expected_keyword}'</span>}
                      </div>
                    </td>
                    <td className="p-5 text-sm font-bold text-muted">{m.retry_policy?.max_retries || 3}</td>
                    <td className="p-5 text-right pr-8 space-x-2">
                      <button onClick={() => navigate(`/monitor/${m.id}`)} className="p-2 text-muted hover:text-accent-primary hover:bg-indigo-50 rounded-xl transition-colors">
                        <Activity size={18} />
                      </button>
                      <button className="p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlCenter;
