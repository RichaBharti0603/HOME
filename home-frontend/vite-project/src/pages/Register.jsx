import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', { email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-in zoom-in duration-500">
        <div className="premium-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-500 mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
          <p className="text-gray-400">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="premium-card p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-secondary/10 text-accent-secondary mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Get Started</h1>
          <p className="text-gray-400 mt-2">Create your privacy-first account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 ml-1">
            <input type="checkbox" required className="mt-1 accent-accent-primary rounded" />
            <p className="text-xs text-gray-500 leading-tight">
              I agree to the <span className="text-accent-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-accent-primary hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-button py-3 flex items-center justify-center gap-2 group bg-gradient-to-r from-accent-secondary to-[#8B5CF6]"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-secondary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;