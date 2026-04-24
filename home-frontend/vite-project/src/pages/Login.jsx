import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield, Activity } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please verify your access key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/5 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div 
             onClick={() => navigate('/')}
             className="inline-flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white font-black shadow-accent-glow">H</div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase">H.O.M.E</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-muted text-sm mt-2">Sign in to your monitoring node</p>
        </div>

        <div className="glass-card !p-8 border-white/5 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="email" 
                  required
                  className="premium-input w-full pl-12"
                  placeholder="admin@h-o-m-e.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="password" 
                  required
                  className="premium-input w-full pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-status-down/10 border border-status-down/20 text-status-down text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="premium-button w-full py-3.5 text-base shadow-xl"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              Don't have an account? {' '}
              <Link to="/register" className="text-accent-primary font-bold hover:underline">Get started free</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
           <div className="flex items-center gap-1.5 grayscale">
              <Shield size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
           </div>
           <div className="flex items-center gap-1.5 grayscale">
              <Activity size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Uptime 99.99%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;