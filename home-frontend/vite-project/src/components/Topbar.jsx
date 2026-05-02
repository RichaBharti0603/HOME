import React, { useState, useEffect } from 'react';
import { Bell, Search, Zap, Activity, BarChart3, Settings, ShieldCheck, MessageSquare, Workflow, Cpu } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const Topbar = ({ title }) => {
  const location = useLocation();
  const [localAIOffline, setLocalAIOffline] = useState(true);
  
  useEffect(() => {
    const checkLocalAI = async () => {
      try {
        const res = await fetch('http://localhost:9000/health');
        if (res.ok) setLocalAIOffline(false);
        else setLocalAIOffline(true);
      } catch (e) {
        setLocalAIOffline(true);
      }
    };
    checkLocalAI();
    const interval = setInterval(checkLocalAI, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Control Center', path: '/control-center', icon: ShieldCheck },
    { label: 'Incidents', path: '/incidents', icon: Zap },
    { label: 'Assistant', path: '/assistant', icon: MessageSquare },
    { label: 'Local AI', path: '/install-local-ai', icon: Cpu },
    { label: 'System Flow', path: '/system-flow', icon: Workflow },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-center pointer-events-none">
      
      {/* Centered Floating Pill Navbar */}
      <div className="w-full max-w-7xl flex items-center justify-between pointer-events-auto">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 bg-surface/80 backdrop-blur-xl border border-white/40 shadow-floating px-4 py-2.5 rounded-bento">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center shadow-accent-glow">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="font-bold text-gray-900 tracking-tight hidden md:block">H.O.M.E</span>
        </div>

        {/* Main Navigation Segment */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface/80 backdrop-blur-xl border border-white/40 shadow-floating p-1.5 rounded-pill">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-300
                ${isActive 
                  ? 'bg-white text-accent-primary shadow-sm ring-1 ring-gray-900/5' 
                  : 'text-muted hover:text-foreground hover:bg-gray-50/50'}
              `}
            >
              <span className="tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Utilities */}
        <div className="flex items-center gap-3 bg-surface/80 backdrop-blur-xl border border-white/40 shadow-floating p-1.5 rounded-pill">
          
          {/* Local AI Status Indicator */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border mr-1 transition-colors ${localAIOffline ? 'bg-gray-50 border-gray-200' : 'bg-blue-50/80 border-blue-200/50'}`}>
            <div className={`w-2 h-2 rounded-full ${localAIOffline ? 'bg-gray-400' : 'bg-blue-500 shadow-accent-glow'}`}></div>
            <span className={`text-[11px] font-bold tracking-wide uppercase ${localAIOffline ? 'text-gray-500' : 'text-blue-600'}`}>
              {localAIOffline ? 'Local AI Offline' : 'Local AI Ready'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-100/50 mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-status-up animate-pulse"></div>
            <span className="text-[11px] font-bold text-emerald-600 tracking-wide uppercase">Operational</span>
          </div>

          <button className="p-2.5 text-muted hover:text-foreground bg-white rounded-full shadow-sm ring-1 ring-gray-900/5 transition-all">
            <Search size={16} />
          </button>
          
          <button className="p-2.5 text-muted hover:text-foreground bg-white rounded-full shadow-sm ring-1 ring-gray-900/5 transition-all relative">
            <Bell size={16} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent-primary rounded-full border-2 border-white"></span>
          </button>
          
          <NavLink to="/settings" className="p-2.5 text-muted hover:text-foreground bg-white rounded-full shadow-sm ring-1 ring-gray-900/5 transition-all">
             <Settings size={16} />
          </NavLink>

          <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block"></div>
          
          <button className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-accent-primary shadow-sm border border-indigo-100/50 hover:bg-indigo-100 transition-colors mr-1">
            AD
          </button>
        </div>

      </div>
    </header>
  );
};

export default Topbar;
