import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Map pathnames to Titles
  const titleMap = {
    '/dashboard': 'Overview',
    '/setup': 'Monitors',
    '/incidents': 'Incident Timeline',
    '/assistant': 'AI Assistant',
    '/settings': 'Settings',
    '/analytics': 'Analytics',
  };

  const title = titleMap[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50 text-foreground flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <Sidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div 
        className={`flex-1 transition-all duration-300 min-h-screen flex flex-col ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Topbar title={title} />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
