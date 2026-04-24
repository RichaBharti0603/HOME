import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Zap, 
  Clock, Shield, Settings, LogOut,
  ChevronRight, BarChart3, MessageSquare
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setCollapsed }) => {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Monitors', icon: Activity, path: '/setup' },
    { label: 'Incidents', icon: Zap, path: '/incidents' },
    { label: 'Assistant', icon: MessageSquare, path: '/assistant' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full glass border-r border-border transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-black">H</div>
            <span className="text-xl font-black text-white tracking-tighter">H.O.M.E</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-black mx-auto">H</div>
        )}
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-xl transition-all group
              ${isActive 
                ? 'bg-accent-primary text-white shadow-accent-glow' 
                : 'text-muted hover:bg-white/5 hover:text-foreground'}
            `}
          >
            <item.icon size={20} className="shrink-0" />
            {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
            {!isCollapsed && (
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-8 left-0 w-full px-4">
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-bold tracking-tight">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
