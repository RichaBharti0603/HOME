import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import api from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Name or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-secondary/5 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
           <div 
             onClick={() => navigate('/')}
             className="inline-flex items-center gap-2 mb-6 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white font-black shadow-accent-glow">H</div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase">H.O.M.E</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-muted text-sm mt-2">Deploy your private monitoring engine today</p>
        </div>

        <div className="glass-card !p-8 border-white/5 shadow-2xl">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="text" 
                  required
                  className="premium-input w-full pl-12"
                  placeholder="John Doe"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="email" 
                  required
                  className="premium-input w-full pl-12"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Confirm Key</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input 
                  type="password" 
                  required
                  className="premium-input w-full pl-12"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <div className="md:col-span-2 p-4 rounded-xl bg-status-down/10 border border-status-down/20 text-status-down text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="md:col-span-2 premium-button py-4 text-base shadow-xl mt-4"
            >
              {loading ? 'Initializing Engine...' : 'Create Account'}
              <Zap size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              Already have an engine? {' '}
              <Link to="/login" className="text-accent-primary font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[10px] text-muted font-bold uppercase tracking-widest leading-loose">
             By joining, you agree to our <span className="text-foreground">Terms of Deployment</span> <br /> 
             and <span className="text-foreground">Privacy Consensus</span>.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Register;