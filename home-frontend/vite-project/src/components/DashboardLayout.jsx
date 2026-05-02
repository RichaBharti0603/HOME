import React from 'react';
import Topbar from './Topbar';
import { useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  // Map pathnames to Titles
  const titleMap = {
    '/dashboard': 'Overview',
    '/control-center': 'Control Center',
    '/incidents': 'Incident Timeline',
    '/assistant': 'AI Assistant',
    '/install-local-ai': 'Local Private AI',
    '/settings': 'Settings',
    '/analytics': 'Analytics',
    '/system-flow': 'System Flow',
    '/cloud-status': 'Cloud Status'
  };

  const title = titleMap[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Topbar title={title} />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 md:py-12 mt-20">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
