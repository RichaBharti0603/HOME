import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Shield, Activity, Zap, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo Mode Intercept
    if (email === 'demo@home.ai' && password === 'Demo@123') {
      setTimeout(() => {
        localStorage.setItem('token', 'demo-token');
        navigate('/dashboard');
      }, 800);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@home.ai');
    setPassword('Demo@123');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/logo.jpg" alt="Logo" className="h-28 w-auto object-contain rounded-xl shadow-sm" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-2">Log in to your dashboard</p>
        </div>

        <div className="glass-card !p-8 bg-white border-gray-200 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  className="premium-input w-full pl-12 bg-white"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                 <label className="text-sm font-medium text-gray-700">Password</label>
                 <button type="button" className="text-xs text-accent-primary font-medium hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  className="premium-input w-full pl-12 bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm font-medium animate-in fade-in flex items-center gap-2">
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="premium-button w-full py-3.5 text-base shadow-md mt-6"
            >
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or try it out</span>
              </div>
            </div>

            <button 
              onClick={handleDemoLogin}
              type="button"
              className="secondary-button w-full mt-6 py-3.5 text-base font-medium"
            >
              <Zap size={18} className="text-accent-primary" />
              Fill Demo Credentials
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account? {' '}
              <Link to="/register" className="text-accent-primary font-semibold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-60">
           <div className="flex items-center gap-1.5 text-gray-500">
              <Shield size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Secure</span>
           </div>
           <div className="flex items-center gap-1.5 text-gray-500">
              <Activity size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Uptime 99.99%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;