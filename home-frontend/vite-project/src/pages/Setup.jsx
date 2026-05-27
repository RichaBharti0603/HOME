import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Globe, Loader2, Mail } from 'lucide-react';
import api from '../utils/api';
import { getStoredUser, updateStoredUser } from '../utils/auth';

const normalizeUrl = (value) => {
  const cleaned = value.trim();
  if (!cleaned) return '';
  return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
};

const Setup = () => {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const [formData, setFormData] = useState({
    url: '',
    project_name: '',
    frequency: '5m',
    alert_email: storedUser?.email || '',
    alert_method: 'email',
  });
  const [loadingUser, setLoadingUser] = useState(!storedUser?.email);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      if (storedUser?.email || localStorage.getItem('token') === 'demo-token') {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        const user = {
          id: response.data.id,
          email: response.data.email,
          onboarding_completed: Boolean(response.data.onboarding_completed ?? response.data.onboarding_complete),
        };
        updateStoredUser(user);
        setFormData((prev) => ({ ...prev, alert_email: user.email || prev.alert_email }));
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login', { replace: true });
        }
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [navigate, storedUser?.email]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const normalizedUrl = normalizeUrl(formData.url);
      if (!normalizedUrl) {
        setError('Please enter your website URL.');
        setSubmitting(false);
        return;
      }

      if (localStorage.getItem('token') !== 'demo-token') {
        await api.post('/onboarding/setup', {
          url: normalizedUrl,
          project_name: formData.project_name.trim() || null,
          website_type: 'Website',
          notify_email: formData.alert_method === 'email',
          notify_dashboard: true,
          alert_email: formData.alert_email.trim(),
          weekly_reports: false,
          frequency: formData.frequency,
          whatsapp_number: formData.alert_method === 'whatsapp' ? '' : null,
          alert_sensitivity: 'Normal',
        });

        await api.put('/onboarding/complete');
      }

      updateStoredUser({ onboarding_completed: true });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Setup failed:', err);
      setError(err.response?.data?.detail || 'We could not save this yet. Please check the website URL and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={28} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 flex justify-center">
      <section className="w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Let&apos;s set up your website monitoring</h1>
          <p className="mt-2 text-sm text-gray-500">A few details so we know what to check and where to notify you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-semibold text-gray-800 mb-2">
              Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="url"
                type="text"
                required
                value={formData.url}
                onChange={(event) => setFormData((prev) => ({ ...prev, url: event.target.value }))}
                placeholder="https://example.com"
                className="premium-input w-full pl-10 bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project_name" className="block text-sm font-semibold text-gray-800 mb-2">
              Website name
            </label>
            <input
              id="project_name"
              type="text"
              value={formData.project_name}
              onChange={(event) => setFormData((prev) => ({ ...prev, project_name: event.target.value }))}
              placeholder="My website"
              className="premium-input w-full bg-white"
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-semibold text-gray-800 mb-2">
              Check interval
            </label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(event) => setFormData((prev) => ({ ...prev, frequency: event.target.value }))}
              className="premium-input w-full bg-white"
            >
              <option value="1m">1 min</option>
              <option value="5m">5 min</option>
              <option value="15m">15 min</option>
              <option value="1h">1 hr</option>
            </select>
          </div>

          <div>
            <label htmlFor="alert_email" className="block text-sm font-semibold text-gray-800 mb-2">
              Alert email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="alert_email"
                type="email"
                required
                value={formData.alert_email}
                onChange={(event) => setFormData((prev) => ({ ...prev, alert_email: event.target.value }))}
                placeholder="you@example.com"
                className="premium-input w-full pl-10 bg-white"
              />
            </div>
          </div>

          <div>
            <span className="block text-sm font-semibold text-gray-800 mb-2">Alert method</span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'email', label: 'Email' },
                { value: 'whatsapp', label: 'WhatsApp' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, alert_method: option.value }))}
                  className={`h-12 rounded-md border text-sm font-semibold transition-colors ${
                    formData.alert_method === option.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="premium-button w-full py-3 text-base font-semibold"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Start monitoring
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Setup;
