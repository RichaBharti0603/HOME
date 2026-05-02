import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
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
            <DashboardLayout>
              <Setup />
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
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;