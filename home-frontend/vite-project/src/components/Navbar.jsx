import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Settings, MessageSquare, LogOut, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AlertPanel from './AlertPanel';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', path: '/assistant', icon: MessageSquare },
    { name: 'Setup', path: '/setup', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/images/logo.jpg" alt="Logo" className="h-16 w-auto object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform" />
        </Link>

        {token && (
          <div className="hidden md:flex items-center gap-1 bg-white/5 border border-border p-1 rounded-xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path 
                    ? "bg-white/10 text-white" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={16} />
                {item.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {token ? (
            <>
              <AlertPanel />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="premium-button px-4 py-2 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
