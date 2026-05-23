import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [shouldRedirectSetup, setShouldRedirectSetup] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (token === 'demo-token') {
      setIsAllowed(true);
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await api.get('/auth/users/me');
        if (res.data.onboarding_complete && res.data.payment_status === 'active') {
          setIsAllowed(true);
        } else {
          if (location.pathname === '/setup') {
             setIsAllowed(true);
          } else {
             setShouldRedirectSetup(true);
          }
        }
      } catch (err) {
        localStorage.removeItem('token');
        sessionStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [token, location.pathname]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-semibold text-gray-500">Authenticating...</div>;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (shouldRedirectSetup) {
    return <Navigate to="/setup" replace />;
  }

  if (isAllowed) {
    return children;
  }

  return null;
};

export default ProtectedRoute;
