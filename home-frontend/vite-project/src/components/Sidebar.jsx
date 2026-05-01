import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Zap, 
  Clock, Shield, Settings, LogOut,
  ChevronRight, BarChart3, MessageSquare
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setCollapsed }) => {
  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Monitors', icon: Activity, path: '/setup' },
    { label: 'Incidents', icon: Zap, path: '/incidents' },
    { label: 'AI Assistant', icon: MessageSquare, path: '/assistant' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-bold">H</div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">H.O.M.E</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-bold mx-auto">H</div>
        )}
      </div>

      <nav className="mt-6 px-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group
              ${isActive 
                ? 'bg-indigo-50 text-accent-primary font-medium' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'}
            `}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm tracking-tight">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-8 left-0 w-full px-4">
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-red-600 hover:bg-red-50 transition-all group font-medium"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm tracking-tight">Sign out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
