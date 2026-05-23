import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Globe,
  LayoutDashboard,
  Loader2,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../utils/api';

const STORAGE_KEY = 'home.setup.wizard';

const websiteTypes = [
  'Personal Portfolio',
  'Business Website',
  'Online Store',
  'Blog',
  'SaaS App',
  'School/College Project',
  'Other',
];

const initialForm = {
  url: '',
  project_name: '',
  website_type: 'Business Website',
  notify_email: true,
  notify_dashboard: true,
  alert_email: '',
  weekly_reports: false,
};

const normalizeUrl = (value) => {
  const cleaned = value.trim();
  if (!cleaned) return '';
  return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
};

const websiteNameFromUrl = (value) => {
  try {
    const host = new URL(normalizeUrl(value)).hostname.replace(/^www\./, '');
    const name = host.split('.')[0].replace(/[-_]/g, ' ');
    return name ? name.replace(/\b\w/g, (char) => char.toUpperCase()) : '';
  } catch {
    return '';
  }
};

const isUrlLike = (value) => {
  try {
    const parsed = new URL(normalizeUrl(value));
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
};

const StepShell = ({ children, step }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={step}
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.99 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [userEmail, setUserEmail] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const progress = Math.round((step / 4) * 100);
  const previewUrl = normalizeUrl(form.url);
  const domain = useMemo(() => {
    try {
      return new URL(previewUrl).hostname.replace(/^www\./, '');
    } catch {
      return 'your website';
    }
  }, [previewUrl]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved?.form) {
      setForm({ ...initialForm, ...saved.form });
      setStep(saved.step || 1);
    }

    const loadStatus = async () => {
      if (localStorage.getItem('token') === 'demo-token') {
        setUserEmail('you@example.com');
        setForm((current) => ({ ...current, alert_email: current.alert_email || 'you@example.com' }));
        setLoadingStatus(false);
        return;
      }

      try {
        const [meRes, statusRes] = await Promise.all([
          api.get('/auth/users/me'),
          api.get('/onboarding/status'),
        ]);

        if (meRes.data.onboarding_complete || statusRes.data.onboarding_complete) {
          navigate('/dashboard', { replace: true });
          return;
        }

        const email = meRes.data.email || statusRes.data.alert_email || '';
        setUserEmail(email);
        setForm((current) => ({
          ...current,
          url: statusRes.data.website_url || current.url,
          project_name: statusRes.data.website_name || current.project_name,
          website_type: statusRes.data.website_type || current.website_type,
          notify_email: statusRes.data.notify_email ?? current.notify_email,
          notify_dashboard: statusRes.data.notify_dashboard ?? current.notify_dashboard,
          alert_email: statusRes.data.alert_email || current.alert_email || email,
          weekly_reports: statusRes.data.weekly_reports ?? current.weekly_reports,
        }));
        if (!saved?.step && statusRes.data.current_step) {
          setStep(Math.min(statusRes.data.current_step, 4));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login', { replace: true });
        } else {
          setError('We had trouble loading your setup. Your saved progress is still here.');
        }
      } finally {
        setLoadingStatus(false);
      }
    };

    loadStatus();
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, form }));
  }, [step, form]);

  const updateForm = (patch) => {
    setError('');
    setForm((current) => ({ ...current, ...patch }));
  };

  const next = () => {
    if (step === 2) {
      if (!isUrlLike(form.url)) {
        setError('Please enter a real website address, like yourwebsite.com.');
        return;
      }
      const formattedUrl = normalizeUrl(form.url);
      updateForm({
        url: formattedUrl,
        project_name: form.project_name.trim() || websiteNameFromUrl(formattedUrl) || 'My Website',
      });
      setToast('Looks good. We will handle the smart setup.');
    }
    if (step === 3 && !form.notify_email && !form.notify_dashboard) {
      setError('Choose at least one way for H.O.M.E to reach you.');
      return;
    }
    setStep((current) => Math.min(current + 1, 4));
  };

  const chooseNotification = (mode) => {
    updateForm({
      notify_email: mode === 'email' || mode === 'both',
      notify_dashboard: mode === 'dashboard' || mode === 'both',
      alert_email: form.alert_email || userEmail,
    });
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        url: normalizeUrl(form.url),
        project_name: form.project_name.trim() || websiteNameFromUrl(form.url) || 'My Website',
        alert_email: form.notify_email ? (form.alert_email || userEmail) : null,
      };

      if (localStorage.getItem('token') !== 'demo-token') {
        const response = await api.post('/onboarding/setup', payload);
        sessionStorage.setItem('home.dashboard.bootstrap', JSON.stringify(response.data));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      localStorage.removeItem(STORAGE_KEY);
      setToast('Monitoring started. Taking you to your dashboard.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Setup could not be completed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white/75 p-8 shadow-floating backdrop-blur-xl">
          <div className="h-3 w-32 rounded-full bg-gray-100 animate-pulse" />
          <div className="mt-8 h-10 w-4/5 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="mt-4 h-4 w-full rounded-full bg-gray-100 animate-pulse" />
          <div className="mt-2 h-4 w-2/3 rounded-full bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_34%),linear-gradient(135deg,#f8fbff_0%,#eef4ff_48%,#f8fafc_100%)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <aside className="hidden lg:block">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative">
              <div className="absolute -inset-10 rounded-full bg-blue-400/10 blur-3xl" />
              <div className="relative rounded-[32px] border border-white/70 bg-white/55 p-8 shadow-floating backdrop-blur-2xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-accent-glow">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500">H.O.M.E setup</p>
                    <p className="text-xl font-black">Smart protection</p>
                  </div>
                </div>

                <div className="mt-10 rounded-[28px] bg-slate-950 p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                        <Globe size={21} />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">{domain}</p>
                        <p className="font-bold">{form.project_name || 'Your website'}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">Ready</span>
                  </div>
                  <div className="mt-8 h-28 rounded-3xl bg-gradient-to-br from-blue-500/30 via-white/10 to-emerald-400/20 p-4">
                    <div className="flex h-full items-end gap-2">
                      {[38, 58, 44, 74, 62, 86, 68].map((height, index) => (
                        <motion.div
                          key={height}
                          initial={{ height: 16 }}
                          animate={{ height }}
                          transition={{ delay: index * 0.05, repeat: Infinity, repeatType: 'mirror', duration: 1.8 }}
                          className="w-full rounded-full bg-white/70"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-white/70">
                    <span className="rounded-2xl bg-white/10 py-3">Always on</span>
                    <span className="rounded-2xl bg-white/10 py-3">Every minute</span>
                    <span className="rounded-2xl bg-white/10 py-3">AI help</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>

          <main className="relative rounded-[32px] border border-white/70 bg-white/76 p-5 shadow-floating backdrop-blur-2xl sm:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className={`grid h-9 w-9 place-items-center rounded-full text-sm font-black transition ${step >= item ? 'bg-blue-600 text-white shadow-accent-glow' : 'bg-slate-100 text-slate-400'}`}>
                        {step > item ? <Check size={16} /> : item}
                      </div>
                      {item < 4 && <div className={`h-1 w-8 rounded-full sm:w-14 ${step > item ? 'bg-blue-600' : 'bg-slate-100'}`} />}
                    </div>
                  ))}
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{progress}%</span>
              </div>
            </div>

            {toast && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={17} /> {toast}
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </motion.div>
            )}

            <StepShell step={step}>
              {step === 1 && (
                <section className="py-8 text-center sm:py-12">
                  <div className="relative mx-auto mb-8 grid h-28 w-28 place-items-center rounded-[32px] bg-blue-600 text-white shadow-accent-glow">
                    <motion.div animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.08, 0.45] }} transition={{ repeat: Infinity, duration: 2.2 }} className="absolute inset-0 rounded-[32px] bg-blue-400" />
                    <Shield className="relative" size={48} />
                  </div>
                  <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Let's protect your website.</h1>
                  <p className="mx-auto mt-4 max-w-xl text-lg font-medium leading-8 text-slate-600">
                    H.O.M.E will monitor your website 24/7 and alert you if something goes wrong.
                  </p>
                  <button onClick={next} className="premium-button mx-auto mt-10 px-8 py-4 text-base">
                    Get Started <ArrowRight size={19} />
                  </button>
                </section>
              )}

              {step === 2 && (
                <section className="space-y-7">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Your website</h2>
                    <p className="mt-2 text-base font-medium text-slate-500">Paste the site. We'll take care of the rest.</p>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-700">What website do you want to monitor?</span>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input autoFocus value={form.url} onChange={(e) => updateForm({ url: e.target.value })} onBlur={() => form.url && updateForm({ url: normalizeUrl(form.url) })} className="premium-input w-full rounded-2xl bg-white/90 py-4 pl-12 text-base" placeholder="https://yourwebsite.com" />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-700">What should we call this website?</span>
                    <input value={form.project_name} onChange={(e) => updateForm({ project_name: e.target.value })} onFocus={() => !form.project_name && updateForm({ project_name: websiteNameFromUrl(form.url) })} className="premium-input w-full rounded-2xl bg-white/90 py-4 text-base" placeholder="My Portfolio" />
                  </label>

                  <div>
                    <span className="mb-3 block text-sm font-black text-slate-700">What type of website is this?</span>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {websiteTypes.map((type) => (
                        <button key={type} type="button" onClick={() => updateForm({ website_type: type })} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${form.website_type === type ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white/80 text-slate-600 hover:border-blue-200'}`}>
                          <Store size={17} />
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="space-y-7">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Stay in the loop</h2>
                    <p className="mt-2 text-base font-medium text-slate-500">How should we notify you if your website goes down?</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['both', 'Both', Bell],
                      ['email', 'Email Notifications', Mail],
                      ['dashboard', 'Dashboard Alerts', LayoutDashboard],
                    ].map(([mode, label, Icon]) => {
                      const active =
                        (mode === 'both' && form.notify_email && form.notify_dashboard) ||
                        (mode === 'email' && form.notify_email && !form.notify_dashboard) ||
                        (mode === 'dashboard' && !form.notify_email && form.notify_dashboard);
                      return (
                        <button key={mode} type="button" onClick={() => chooseNotification(mode)} className={`rounded-3xl border p-5 text-left transition ${active ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white/80 hover:border-blue-200'}`}>
                          <Icon className={active ? 'text-blue-600' : 'text-slate-400'} size={24} />
                          <p className="mt-4 text-sm font-black">{label}</p>
                        </button>
                      );
                    })}
                  </div>

                  {form.notify_email && (
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-slate-700">Email</span>
                      <input value={form.alert_email || userEmail} onChange={(e) => updateForm({ alert_email: e.target.value })} className="premium-input w-full rounded-2xl bg-white/90 py-4 text-base" placeholder="you@example.com" />
                    </label>
                  )}

                  <button type="button" onClick={() => updateForm({ weekly_reports: !form.weekly_reports })} className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white/80 p-5 text-left transition hover:border-blue-200">
                    <div>
                      <p className="font-black text-slate-900">Would you like weekly health reports?</p>
                      <p className="mt-1 text-sm font-medium text-slate-500">A simple summary in your inbox.</p>
                    </div>
                    <span className={`relative h-8 w-14 rounded-full transition ${form.weekly_reports ? 'bg-blue-600' : 'bg-slate-200'}`}>
                      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${form.weekly_reports ? 'left-7' : 'left-1'}`} />
                    </span>
                  </button>
                </section>
              )}

              {step === 4 && (
                <section className="space-y-7">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Ready to start</h2>
                    <p className="mt-2 text-base font-medium text-slate-500">H.O.M.E will quietly keep watch from here.</p>
                  </div>

                  <div className="rounded-[30px] bg-slate-950 p-6 text-white shadow-2xl">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                          <Globe size={25} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black">{form.project_name || websiteNameFromUrl(form.url) || 'My Website'}</h3>
                          <p className="max-w-[260px] truncate text-sm font-medium text-white/55">{previewUrl}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80">Every minute</span>
                        <span className="rounded-full bg-blue-400/20 px-3 py-1.5 text-xs font-black text-blue-100">AI protection</span>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      {[
                        'Website availability',
                        'Downtime incidents',
                        'Performance trends',
                        'Security availability checks',
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white/80">
                          <CheckCircle2 size={17} className="text-emerald-300" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 text-blue-600" size={20} />
                      <p className="text-sm font-semibold leading-6 text-blue-900">
                        Your dashboard will open as soon as setup is complete, with your first monitor card already active.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </StepShell>

            {step > 1 && (
              <div className="mt-9 flex items-center justify-between gap-4">
                <button disabled={submitting} onClick={() => setStep((current) => Math.max(current - 1, 1))} className="secondary-button px-5 py-3">
                  <ArrowLeft size={18} /> Back
                </button>
                {step < 4 ? (
                  <button onClick={next} className="premium-button px-6 py-3">
                    Next <ArrowRight size={18} />
                  </button>
                ) : (
                  <button onClick={submit} disabled={submitting} className="premium-button px-6 py-3">
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
                    {submitting ? 'Starting monitoring...' : 'Start Monitoring'}
                  </button>
                )}
              </div>
            )}

            {error && step === 4 && (
              <button onClick={submit} disabled={submitting} className="secondary-button mt-4 w-full py-3">
                <RefreshCw size={17} /> Try again
              </button>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
