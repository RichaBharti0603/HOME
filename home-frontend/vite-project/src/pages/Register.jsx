import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import api, { requestWithRetry } from '../utils/api';

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

  useEffect(() => {
    window.history.replaceState(null, '', window.location.href);
    localStorage.removeItem('auth-storage');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    const resetTimer = window.setTimeout(() => {
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }, 0);
    return () => {
      window.clearTimeout(resetTimer);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };
      console.log("REGISTER PAYLOAD:", { email: payload.email, password: '[hidden]' });
      
      const response = await requestWithRetry(
        () => api.post('/auth/register', payload),
        5,
        2000,
        (retriesLeft, nextDelay) => {
          setError(`Connecting to server... Server is starting up (cold start). Retrying in ${nextDelay / 1000}s...`);
        }
      );
      
      console.log("Registration successful:", response.data);
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      // Immediate redirect without blocking alert
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
    } catch (err) {
      console.error("Registration error:", err);
      if (!err.response) {
        console.log("Network issue or backend crash (Render cold start)");
        setError('Network Error: Cannot reach the server. The server is taking too long to start. Please try again in a few moments.');
      } else {
        console.log("Backend error:", err.response.data);
        setError(err.response.data?.detail || 'Registration failed. Email may already be registered.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative h-full overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-8">
              <img src="/images/logo.jpg" alt="Logo" className="h-28 w-auto object-contain rounded-xl shadow-sm" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create your account</h1>
            <p className="text-gray-500 mt-2">Start monitoring your website today</p>
          </div>

          <div className="glass-card !p-8 bg-white border-gray-200 shadow-xl">
            <form onSubmit={handleRegister} className="space-y-5" autoComplete="off">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    className="premium-input w-full pl-12 bg-white"
                    placeholder="Jane Doe"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    autoComplete="off"
                    name="home-register-name"
                    id="home-register-name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    required
                    className="premium-input w-full pl-12 bg-white"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    autoComplete="off"
                    name="home-register-email"
                    id="home-register-email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    required
                    className="premium-input w-full pl-12 bg-white"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    autoComplete="off"
                    name="home-register-password"
                    id="home-register-password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    required
                    className="premium-input w-full pl-12 bg-white"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    autoComplete="off"
                    name="home-register-confirm-password"
                    id="home-register-confirm-password"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in">
                  {error}
                </div>
              )}

              <button 
                disabled={loading}
                className="premium-button w-full py-3.5 text-base shadow-md mt-6"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Already have an account? {' '}
                <Link to="/login" className="text-accent-primary font-semibold hover:underline">Log in</Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center px-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              By joining, you agree to our <button onClick={() => alert('Terms modal')} className="text-gray-900 font-medium hover:underline">Terms of Service</button> <br /> 
              and <button onClick={() => alert('Privacy modal')} className="text-gray-900 font-medium hover:underline">Privacy Policy</button>.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Image */}
      <div className="hidden lg:block lg:w-1/2 h-full bg-white p-6 pl-0">
        <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] shadow-2xl">
          <img 
            src="/images/second.jpg" 
            alt="Dashboard Interface" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h2 className="text-3xl font-bold mb-2">Monitor with Precision</h2>
            <p className="text-white/90 text-lg">H.O.M.E gives you real-time visibility into your infrastructure with intelligent alerts and sleek visualization.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
