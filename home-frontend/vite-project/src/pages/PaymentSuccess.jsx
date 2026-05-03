import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import api from '../utils/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // In a real app, you might verify the session_id here or rely on the webhook.
    // For now, we assume the webhook fired and user is fully onboarded.
    const interval = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);

    setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bento-card max-w-md w-full text-center py-12 px-8 shadow-2xl">
        <div className="mx-auto w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-500 mb-8">
          Your subscription is now active. Your monitors have been provisioned and are actively scanning.
        </p>
        <div className="flex items-center justify-center gap-3 text-sm font-semibold text-accent-primary">
          <Loader2 className="animate-spin" size={18} />
          Redirecting to dashboard in {countdown}s...
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
