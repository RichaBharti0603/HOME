import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import ControlCenter from './pages/ControlCenter';
import Assistant from './pages/Assistant';
import MonitorDetail from './pages/MonitorDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import IncidentTimeline from './pages/IncidentTimeline';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import SystemFlow from './pages/SystemFlow';
import InstallLocalAI from './pages/InstallLocalAI';
import CloudSystemStatus from './pages/CloudSystemStatus';
import QueueHealth from './pages/QueueHealth';
import AlertCenter from './pages/AlertCenter';
import OnboardingWizard from './pages/OnboardingWizard';
import PaymentSuccess from './pages/PaymentSuccess';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      <Routes>
        {/* Public Marketing Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/setup" element={
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        } />
        
        <Route path="/payment-success" element={<PaymentSuccess />} />
        
        <Route path="/control-center" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ControlCenter />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/assistant" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Assistant />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/monitor/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <MonitorDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/incidents" element={
          <ProtectedRoute>
            <DashboardLayout>
              <IncidentTimeline />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/system-flow" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SystemFlow />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/cloud-status" element={
          <ProtectedRoute>
            <DashboardLayout>
              <CloudSystemStatus />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/queue-health" element={
          <ProtectedRoute>
            <DashboardLayout>
              <QueueHealth />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/alert-center" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AlertCenter />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/install-local-ai" element={
          <ProtectedRoute>
            <DashboardLayout>
              <InstallLocalAI />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;