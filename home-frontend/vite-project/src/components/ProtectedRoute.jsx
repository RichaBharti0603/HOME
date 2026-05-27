import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api, { requestWithRetry } from '../utils/api';
import { clearAuthSession, getStoredUser, setAuthSession } from '../utils/auth';

const ProtectedRoute = ({ children, requireOnboarding = true, setupOnly = false }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [wakingUp, setWakingUp] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [redirectTo, setRedirectTo] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (token === 'demo-token') {
      const demoUser = getStoredUser() || { id: 'demo', email: 'demo@home.ai', onboarding_completed: false };
      if (setupOnly && demoUser.onboarding_completed) {
        setRedirectTo('/dashboard');
      } else if (requireOnboarding && !demoUser.onboarding_completed && !setupOnly) {
        setRedirectTo('/setup');
      } else {
        setIsAllowed(true);
      }
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await requestWithRetry(
          () => api.get('/auth/me'),
          5,
          2000,
          () => setWakingUp(true)
        );
        const onboardingCompleted = Boolean(res.data.onboarding_completed ?? res.data.onboarding_complete);
        setAuthSession(token, {
          id: res.data.id,
          email: res.data.email,
          onboarding_completed: onboardingCompleted,
        });

        if (setupOnly && onboardingCompleted) {
          setRedirectTo('/dashboard');
        } else if (requireOnboarding && !onboardingCompleted) {
          setRedirectTo('/setup');
        } else {
          setIsAllowed(true);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        // Only remove token if it's explicitly an auth status error (401/403)
        if (err.response && [401, 403].includes(err.response.status)) {
          clearAuthSession();
        }
      } finally {
        setWakingUp(false);
        setLoading(false);
      }
    };
    checkStatus();
  }, [token, location.pathname]);

  if (wakingUp) {
    return (
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_34%),linear-gradient(135deg,#f8fbff_0%,#eef4ff_48%,#f8fafc_100%)] flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/75 p-8 shadow-floating backdrop-blur-xl text-center space-y-6">
          <div className="relative mx-auto w-16 h-16 bg-indigo-50 border border-indigo-100 flex items-center justify-center text-accent-primary rounded-2xl shadow-sm">
            <div className="absolute inset-0 rounded-2xl bg-indigo-400/20 animate-ping"></div>
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Server is waking up</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Our cloud instance takes a few seconds to warm up after a period of inactivity. Your request will automatically resume.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-semibold text-gray-500">Authenticating...</div>;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (isAllowed) {
    return children;
  }

  return null;
};

export default ProtectedRoute;
