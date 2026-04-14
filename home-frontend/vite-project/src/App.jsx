import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Assistant from './pages/Assistant';
import MonitorDetail from './pages/MonitorDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import IncidentTimeline from './pages/IncidentTimeline';
import Settings from './pages/Settings';

const Landing = () => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in duration-1000">
    <div className="space-y-4">
      <div className="inline-block p-1 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary mb-4">
        <div className="bg-background rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase text-white">
          Production Grade Observability
        </div>
      </div>
      <h1 className="text-6xl font-bold tracking-tighter text-white">
        Monitoring for the <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
          Privacy-First
        </span> Era.
      </h1>
      <p className="max-w-xl mx-auto text-gray-400 text-lg">
        H.O.M.E combines ultra-low latency monitoring with local AI failure analysis. 
        Zero external API calls. Total control.
      </p>
    </div>
    
    <div className="flex gap-4">
      <button 
        onClick={() => window.location.href = '/dashboard'} 
        className="premium-button px-8 py-3 text-lg"
      >
        Get Started
      </button>
      <button className="px-8 py-3 rounded-lg border border-border hover:bg-white/5 transition-colors font-medium text-white">
        View Sandbox
      </button>
    </div>

    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
      <div className="p-6 glass rounded-2xl group hover:border-accent-primary/50 transition-colors">
        <h3 className="font-bold mb-2 text-white">3s Resolution</h3>
        <p className="text-sm text-gray-500">Real-time health checks with sub-second latency precision.</p>
      </div>
      <div className="p-6 glass rounded-2xl group hover:border-accent-primary/50 transition-colors">
        <h3 className="font-bold mb-2 text-white">Local AI Engine</h3>
        <p className="text-sm text-gray-500">Privacy-centric failure analytics running on your own metal.</p>
      </div>
      <div className="p-6 glass rounded-2xl group hover:border-accent-primary/50 transition-colors">
        <h3 className="font-bold mb-2 text-white">Edge Reporting</h3>
        <p className="text-sm text-gray-500">Beautiful observability dashboards for all your web services.</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent-primary/30">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-12">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/setup" element={
            <ProtectedRoute>
              <Setup />
            </ProtectedRoute>
          } />
          
          <Route path="/assistant" element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          } />
          
          <Route path="/monitor/:id" element={
            <ProtectedRoute>
              <MonitorDetail />
            </ProtectedRoute>
          } />

          <Route path="/incidents" element={
            <ProtectedRoute>
              <IncidentTimeline />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;